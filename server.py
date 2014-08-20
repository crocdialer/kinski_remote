#!/usr/bin/env python
'''
kinski_remote
Created on August 20, 2014
@author: crocdialer@googlemail.com 
'''

import os, datetime, socket, sqlite3

from bottle import route, run, template, view, Bottle
from bottle import get, post, request
from bottle import static_file

# our Bottle app instance
app = Bottle()

TCP_IP = '127.0.0.1'
TCP_PORT = 33333
BUFFER_SIZE = 16384

@app.get('/') 
@app.get('/view') # or @route('/view')
@view('index')
def index_view():
    return dict()

@app.get('/state') 
def get_state():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((TCP_IP, TCP_PORT))
    s.send("pupuuu from russia")
    data = s.recv(BUFFER_SIZE)
    s.close()
    return data

# Static Routes
@app.get('/static/img/<filename:re:.*\.(jpg|jpeg|png|JPG|JPEG|PNG|svg|gif)>')
def internal_images(filename):
  return static_file(filename, root='static/img')

@app.get('/static/js/<filename:re:.*\.js>')
def javascripts(filename):
    return static_file(filename, root='static/js')

@app.get('/static/css/<filename:re:.*\.css>')
def stylesheets(filename):
    return static_file(filename, root='static/css')

@app.get('/static/fonts/<filename:re:.*\.(eot|ttf|woff|svg)>')
def fonts(filename):
    return static_file(filename, root='static/fonts')

# standalone server
if __name__ == '__main__':
  # start server
  run(app, host='0.0.0.0', port=8080, debug=True)
