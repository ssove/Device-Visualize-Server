var map_manager = (function(){
    var INSTANCE;

    var WIDTH, HEIGHT,
        CENTERED, CREATED,
        MAP_CONTAINER_ID = '#map',
        KOREA_PROVINCE_OBJECT = 'skorea_provinces_2018_geo',
        KOREA_MUNICIPALITIES_OBJECT = 'skorea_municipalities_2018_geo',
        SPECIAL_CITIES = ['서울특별시', '인천광역시', '대전광역시', '대구광역시', '부산광역시', '울산광역시', '광주광역시', '세종특별자치시', '제주특별자치도'];

    var projection, path, svg,
        province_geo_json, municipalities_geo_json,
        province_features, municipalities_features, bounds, center,
        map, sub_map, sub_labels;

    var div_tool_tip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    function create_map(){
        /*
            after read korea path data from json file( KOREA_JSON_DATA_URL, MUNICIPALITIES_JSON_DATA_URL)
            set values ( boundary, center, scale, distance)

            then, create map & sub map on web document
         */
        return new Promise( function (resolve) {
            d3.json( PROVINCE_JSON_DATA_URL).then( function( province_json_data){
                d3.json( MUNICIPALITIES_JSON_DATA_URL).then( function(municipalities_json_data){
                    province_geo_json = topojson.feature( province_json_data, province_json_data.objects[ KOREA_PROVINCE_OBJECT]);
                    province_features = province_geo_json.features;

                    municipalities_geo_json = topojson.feature( municipalities_json_data, municipalities_json_data.objects[ KOREA_MUNICIPALITIES_OBJECT]);
                    municipalities_features = municipalities_geo_json.features;

                    bounds = d3.geoBounds( province_geo_json);
                    center = d3.geoCentroid( province_geo_json);

                    var distance = d3.geoDistance( bounds[0], bounds[1]);
                    var scale = HEIGHT / distance / Math.sqrt(2) * 1.2;

                    projection.scale( scale).center( center);

                    sub_map.selectAll( "path")
                        .data( municipalities_features)
                        .enter().append( "path")
                        .attr( "class", function( d) { return "subMunicipality c " + d.properties.code;})
                        .attr( "d", path)
                        .style("opacity", 0)
                        .on("mouseover", sub_municipality_mouse_over)
                        .on("mouseout", sub_municipality_mouse_out);

                    map.selectAll( "path")
                        .data( province_features)
                        .enter().append( "path")
                        .attr( "class", function(d) { return "municipality c " + d.properties.code;})
                        .attr( "d", path)
                        .on("click", province_clicked);

                    CREATED = true;

                    resolve();
                })
            });
        });
    }

    function spotting_on_map( spot_data){
        /*
            spot device location on map with circle
            data derived from ['testSpots.json'] now
         */
        if( CREATED) spot()
        else {
            create_map().then( function(){
                spot()
            });
        }

        function spot(){
            var circles = map.selectAll("circle")
                .data( spot_data).enter()
                .append( "circle")
                .attr("cx", function( d){ return projection( [d.lon, d.lat])[0]; })
                .attr("cy", function( d){ return projection( [d.lon, d.lat])[1]; })
                .attr("r", "2px")
                .attr("fill", "red")
                .on('click', function( d){ specific_device_modal(d);})
                .transition()
                .ease( d3.easeElastic);
        }
    }

    function get_municipalities_in_province(province_code, callback){
        /*
            catch sub-municipalties in province
         */
        var result = [];
        var count = 0;

        for(var i = 0; i < municipalities_features.length; i++){
            var current = municipalities_features[i];
            if( current.properties.code.substr(0,2) === province_code.toString())
                result.push( current.properties.code.toString());
        }

        callback( result)
    }

    // event handlers below

    function sub_municipality_mouse_over(d){
        div_tool_tip.transition()
            .duration(200)
            .style("opacity", .8);
        div_tool_tip.html( d.properties['name_eng'])
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY + 5) + "px");
    }

    function sub_municipality_mouse_out(d){
        div_tool_tip.transition()
            .duration(500)
            .style("opacity", 0);
    }

    function province_clicked( d){
        /*
            set CENTERED & zoom_level via mouse click (zoom_level is slightly different from each other.)
            then, transform map contents
         */
        var x, y, zoom_level;
        if( d && CENTERED != d){
            var centroid = path.centroid( d);

            x = centroid[0];
            y = centroid[1];

            if( d.properties.name == '제주특별자치도' || d.properties.name == '인천광역시')
                zoom_level = 10;
            else if( SPECIAL_CITIES.indexOf( d.properties.name) != -1)
                zoom_level = 15;
            else
                zoom_level = 3;
            CENTERED = d;
            zoom( d, x, y, zoom_level);
        } else {
            CENTERED = null;
            zoom( d, WIDTH / 2, HEIGHT / 2, 1);
        }

        get_municipalities_in_province( d.properties.code, function(_selected){
            sub_map.selectAll( "path")
                .classed( "active", CENTERED &&  function( _d) {return _selected.indexOf( _d.properties.code.toString()) != -1;})
        });
    }

    function zoom(d, x, y, zoom_level){
        /*
            zoom map, sub_map according to zoom_level with center point(x, y)
         */
        map.selectAll( "path")
            .classed( "active", CENTERED && function(d) { return d === CENTERED;});

        map.transition()
            .duration( 750)
            .attr( "transform", "translate(" + WIDTH / 2 + "," + HEIGHT / 2 + ")scale(" + zoom_level + ")translate(" + -x + "," + -y + ")")
            .style( "stroke-width", 1.5 / zoom_level + "px");

        sub_map.transition()
            .duration( 750)
            .attr( "transform", "translate(" + WIDTH / 2 + "," + HEIGHT / 2 + ")scale(" + zoom_level + ")translate(" + -x + "," + -y + ")")
            .style( "stroke-width", 1.5 / zoom_level + "px");
    }

    function initialize(){
        /*
            set map container`s height & width

            use mercator method for projection & path
            create buttons(svg) for provinces

            then, initialize map contents
                create map on web document
                spot device locations on map

            map is created on sub_map to show detail path with activated
         */
        HEIGHT = window.innerHeight - 40;
        WIDTH = $('#map').width();

        projection = d3.geoMercator().translate( [WIDTH / 2, HEIGHT / 2]);
        path = d3.geoPath().projection( projection);

        svg = d3.select( MAP_CONTAINER_ID).append( "svg")
            .attr( "width", WIDTH)
            .attr( "height", HEIGHT);

        sub_map = svg.append( "g").attr( "id", "subMap");
        map = svg.append( "g").attr( "id", "map");
        sub_labels = svg.append( "g").attr( "id", "subLabels");

        INSTANCE = {};
        INSTANCE.spotting_on_map = spotting_on_map;
    }

    return {
        /*
            singleton for resize
         */
        get_instance: function() {
            if (! INSTANCE)
                initialize();
            return INSTANCE;
        },
        resize_window: function( _data){
            CREATED = false;
            $('#map').empty();
            initialize();
            spotting_on_map( _data);
        }
    }
})();

/*
    below 2 functions for analyzing spot in area. but not use...
*/

function detect_spot_in_area( spot, area){
    /*
        detect that is a spot in concave polygon.
        crosses is the number of points between right half-line from a point(spot) and polygon.
        if crosses is an odd number, it is in area.
     */

    var crosses = 0,
        coordinates = area.geometry.coordinates[0];

    for( var i = 0; i < coordinates.length; i++){
        var j = (i + 1) % coordinates.length;
        // spot is on line( area[i] to area[j])
        if( (coordinates[i][1] > spot[1]) != (coordinates[j][1] > spot[1])){
            var atX = ( coordinates[j][0] - coordinates[i][0]) *
                ( spot[1] - coordinates[i][1]) /
                ( coordinates[j][1] - coordinates[i][1]) + coordinates[i][0];
            if (spot[0] < atX)
                crosses += 1;
        }
    }

    return crosses % 2 > 0;
}

function get_centerSpots_on_province(path, province_features){
    var MUNICIPALITIES_OBJECT = 'skorea_municipalities_2018_geo',
        result = {};
    d3.json( MUNICIPALTIES_JSON_DATA_URL).then( function(data){
        var municipalities_features = topojson.feature( data, data.objects[ MUNICIPALITIES_OBJECT]);

        for(var i = 0; i < municipalities_features.features.length; i++){
            var current_feature = municipalities_features.features[i];
            var current_center = d3.geoCentroid( current_feature),
                current_local_code = current_feature.properties.code;

            for(var j = 0; j < province_features.features.length; j++){
                var province = province_features.features[j];
                if( detect_spot_in_area( current_center, province)){
                    if( province.properties.code in result)
                        result[ province.properties.code].push( current_local_code);
                    else
                        result[ province.properties.code] = [ current_local_code]
                }
            }
        }
    });

    return result;
}