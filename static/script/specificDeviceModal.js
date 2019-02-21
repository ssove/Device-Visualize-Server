String.prototype.format = function() {
    ret = this;
    for (index in arguments) {
        ret = ret.replace("{" + index + "}", arguments[index])
    }
    return ret;
}

function specific_device_modal( device_info){
    function get_data_about_device( callback){
        /*
            receive device acc data from server
            not yet.
         */
        callback();
    }

    function set_device_default_info(){
        /*
            set device`s default information( tag, location, power)
         */
        $('#deviceTag').text(device_info['device-tag']);
        $('#deviceLocation').text( "{0} {1} {2} {3}"
            .format(device_info['province'],
                device_info['municipality'],
                device_info['sub-municipality'],
                device_info['detail']));
        $("#devicePower").text("On");
    }

    function create_graphs(){
        /*
            create graph for acc x, y, z data on modal
         */
        create_line_chart( TEST_CSV_GRAPH_DATA_URL, null,'#xModalAccGraph', 'x');
        create_line_chart( TEST_CSV_GRAPH_DATA_URL, null,'#yModalAccGraph', 'y');
        create_line_chart( TEST_CSV_GRAPH_DATA_URL, null,'#zModalAccGraph', 'z');
    }

    function load_images(image_urls){
        for(var i = 0; i < image_urls.length; i++)
            $('#deviceImages').append("<img src='{0}' class='img-fluid' alt='Cannot load image.'>"
                .format( image_urls[i]));
    }

    function get_image_urls(){
        return ['https://search.pstatic.net/sunny/?src=https%3A%2F%2Fgcc.gnu.org%2Fbugzilla%2Fdata%2Fwebdot%2F5z6lSD3pNh.png&type=b400']
    }

    function clear_modal( callback){
        /*
            clear modal divs
         */
        $('#deviceTag').empty();
        $('#deviceLocation').empty();
        $('#devicePower').empty();
        $('#deviceImages').empty();
        $('#xModalAccGraph').empty();
        $('#yModalAccGraph').empty();
        $('#zModalAccGraph').empty();
        callback();
    }

    // in some case, modal open several times... variable SHOWN is for that case
    var SHOWN = false;

    $('#deviceModal').modal('show');
    $('#deviceModal').on('shown.bs.modal', function (e) {
        if( !SHOWN){
            clear_modal(function () {
                set_device_default_info();
                get_data_about_device(function () {
                    load_images( get_image_urls());
                    create_graphs();
                });
            });
            SHOWN = true;
        }
    });
}