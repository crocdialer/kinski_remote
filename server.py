#!/usr/bin/env python
'''
kinski_remote
Created on August 20, 2014
@author: crocdialer@googlemail.com
'''

import os, datetime, socket, select, struct

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
        response.set_header('Content-type', 'image/png')

    except socket.error as e:
        if e.errno == os.errno.ECONNREFUSED:
            print("could not connect with kinskiGL")
        else: print("socket error")

    s.close()
    return data

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
  run(app, host='0.0.0.0', port=8080, debug=True, reloader=True)
