from django.http import HttpResponse
from django.template import loader

def show_devices_on_map( request):
    def get():
        template = loader.get_template('map/main.html')
        return HttpResponse(template.render())

    if request.method == 'GET':
        return get()
    else:
        return HttpResponse( status= 405)