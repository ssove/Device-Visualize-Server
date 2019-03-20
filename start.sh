#!/bin/bash

help(){
    echo "Incorrect Usage:"
    echo "\$ start.sh -h {host} -p {port}"
}

host_ip="155.230.28.129"
port=9010

# START RUN SERVER
while getopts "h:p:" opt
do
    case $opt in
        h)
            host_ip=$OPTARG
            ;;
        p)
            port=$OPTARG
            ;;
        *)
            help
            exit 0
            ;;
    esac
done

echo "Running django server host: ${host_ip} port: ${port} ..."
python3 manage.py runserver ${host_ip}:${port}
