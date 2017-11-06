#!/usr/bin/env python3
'''
kinski_remote
Created on August 20, 2014
@author: crocdialer@googlemail.com
'''

# gevent needed for server sent events
from gevent import monkey; monkey.patch_all()

import os, datetime, time, socket, select, struct

from bottle import route, run, template, view, response, Bottle
from bottle import get, post, request
from bottle import static_file

# our Bottle app instance
app = Bottle()

TCP_IP = '127.0.0.1'
TCP_PORT = 33333
BUFFER_SIZE = 65536

@app.get('/')
@app.get('/view') # or @route('/view')
@view('index')
def index_view():
    return dict()

@app.get('/state')
def get_state():
    data = b''
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect((TCP_IP, TCP_PORT))
        s.send(bytearray("request_state", 'utf-8'))
        data = s.recv(BUFFER_SIZE)
    except socket.error as e:
        if e.errno == os.errno.ECONNREFUSED:
            print("could not connect with kinskiGL")
        else: print("socket error")
    s.close()
    return data

@app.post('/state')
def set_state():
    data = request.body.read()
    #print request.json
    print(data)
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect((TCP_IP, TCP_PORT))
        s.send(data)
    except socket.error as e:
        if e.errno == os.errno.ECONNREFUSED:
            print("could not connect with kinskiGL")
        else: print("socket error")
    s.close()
    return "poop"

@app.get('/cmd/<the_cmd>')
def execute_command(the_cmd):
    print("generic command: '{}'".format(the_cmd))
    data = b''
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect((TCP_IP, TCP_PORT))
        s.send(bytearray(the_cmd, 'utf-8'))

        s.setblocking(0)
        timeout_in_seconds = 1.0
        ready = select.select([s], [], [], timeout_in_seconds)
        if ready[0]:
            data = s.recv(BUFFER_SIZE)
    except socket.error as e:
        if e.errno == os.errno.ECONNREFUSED:
            print("could not connect with kinskiGL")
        else: print("socket error")

    s.close()
    return data

def recvall(sock, count):
    sock.settimeout(10)
    buf = b''
    while count:
        newbuf = sock.recv(count)
        if not newbuf: return None
        buf += newbuf
        count -= len(newbuf)
    return buf

@app.get('/cmd/generate_snapshot')
def generate_snapshot():
    print("generate_snapshot")
    data = b''
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect((TCP_IP, TCP_PORT))
        s.send(bytearray("generate_snapshot", 'utf-8'))

        # first 4 bytes contain message size as uint32_t
        tmp = s.recv(4)
        data_length, = struct.unpack('I', tmp)

        # now receive all bytes
        data = recvall(s, data_length)

        if len(data) != data_length:
            print("error: wrong datalength. expected: {} got: {}".format(data_length, len(data)))
        response.set_header('Content-type', 'image/jpeg')

    except socket.error as e:
        if e.errno == os.errno.ECONNREFUSED:
            print("could not connect to an kinskiGL instance")
        else: print("socket error")

    s.close()
    return data

##################### Server Sent Events ########################

def sse_pack(d):
    """Pack data in SSE format"""
    buffer = ''
    for k in ['retry','id','event','data']:
        if k in d.keys():
            buffer += '%s: %s\n' % (k, d[k])
    return buffer + '\n'

@app.get("/log_stream")
def stream_generator():

    # Keep event IDs consistent
    event_id = 0

    if 'Last-Event-Id' in request.headers:
        event_id = int(request.headers['Last-Event-Id']) + 1

    # Set up our message payload with a retry value in case of connection failure
    # (that's also the polling interval to be used as fallback by our polyfill)
    msg = {'retry': '2000'}

    # Provide an initial data dump to each new client
    response.headers['content-type'] = 'text/event-stream'
    response.headers['Access-Control-Allow-Origin'] = '*'

    msg.update(
    {
         'event': 'init',
         'data' : "log_stream not connected... event_id: " + str(event_id) + "\n",
         'id'   : event_id
    })
    yield sse_pack(msg)

    app_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    is_connected = False

    try:
        app_socket.connect((TCP_IP, TCP_PORT))
        app_socket.send(bytearray("log_stream", 'utf-8'))
        is_connected = True
    except socket.error as e:
        if e.errno == os.errno.ECONNREFUSED:
            print("could not connect to an kinskiGL instance")
        else: print("socket error")

    # set non-blocking
    timeout_secs = 2.0
    app_socket.settimeout(timeout_secs)

    # Now give them deltas as they arrive (say, from a message broker)
    event_id += 1
    while is_connected:

        buf = b''
        new_byte = b''

        while is_connected and new_byte != b'\n' and app_socket.fileno() >= 0:
            try:
                # receive 1 byte at a time
                new_byte = app_socket.recv(1)
                if new_byte: buf += new_byte

            except socket.error as e:
                is_connected = False
                app_socket.close()

        msg.update(
        {
             'event': 'new_log_line',
             'data' : buf,
             'id'   : event_id
        })
        if is_connected:
            yield sse_pack(msg)
            event_id += 1

    app_socket.close()

#######################################################################

# Static Routes
@app.get('/static/img/<filename:re:.*\.(jpg|jpeg|png|JPG|JPEG|PNG|svg|gif)>')
def internal_images(filename):
  return static_file(filename, root='static/img')

@app.get('/static/js/<filename:re:.*\.js>')
def javascripts(filename):
    return static_file(filename, root='static/js')

@app.get('/static/data/<filename:re:.*\.(json|xml)>')
def data_files(filename):
    return static_file(filename, root='static/data')

@app.get('/static/css/<filename:re:.*\.css>')
def stylesheets(filename):
    return static_file(filename, root='static/css')

@app.get('/static/fonts/<filename:re:.*\.(eot|ttf|woff|woff2|svg)>')
def fonts(filename):
    return static_file(filename, root='static/fonts')

# standalone server
if __name__ == '__main__':
  # start server
  run(app, server='gevent', host='0.0.0.0', port=8888, debug=True, reloader=True)
