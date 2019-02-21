from django.urls import path
from django.conf.urls.static import static
from django.conf import settings

from MainApplication.Api import map

urlpatterns = [
    path('', map.show_devices_on_map, name='DeviceStatusOnMap'),
]

# set static path
urlpatterns += static( '/static/', document_root= settings.STATIC_ROOT)