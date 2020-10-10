from config import TestingConfig

from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from pymongo import MongoClient
import os
import json
from bson.objectid import ObjectId


class JSONEncoder(json.JSONEncoder):
    ''' extend json-encoder class'''

    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)

app = Flask(__name__)
CORS(app)
app.config.from_object(TestingConfig())
app.json_encoder = JSONEncoder

client = MongoClient()
db = client.geojson_flask

geodata_collection = db.geodata

@app.route('/')
def index():
    return "Hello World!"

@app.route("/api/db", methods=["POST", "GET"])
@cross_origin()
def data():
    if request.method == "GET":
        data_cursor = geodata_collection.find()
        resp = []
        for data in data_cursor:
            resp.append(data)
        print(resp)
        print(JSONEncoder().encode(resp))
        return JSONEncoder().encode(resp), 200
    
    if request.method == "POST":
        data = request.get_json()
        print(data)
        res = geodata_collection.insert_one(data)
        print(res.inserted_id)
        return jsonify({"message": "data inserted"}), 200

    return '''
    <!doctype html>
    <title>Upload new File</title>
    <h1>Upload new File</h1>
    <form method=post enctype=multipart/form-data>
      <input type=file name=file>
      <input type=submit value=Upload>
    </form>
    '''

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)

if __name__ == '__main__':
    app.run()