from flask import Flask, jsonify, current_app
import json

app = Flask(__name__)

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/')
def hello_world():
    output = {"name": "</script><script>alert('json xss!');</script>" +
                      "<img src='xx' onerror=alert('jsonimgalert')>"}
    return jsonify(output)
    # output as HTML will pop the XSS (okay if application/json)
    #return json.dumps(output)

if __name__ == '__main__':
    app.run(port=1234, debug=True)
