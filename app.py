from config import TestingConfig

from flask import Flask, request, jsonify
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

app = Flask(__name__,static_folder='../client/dist')
app.config.from_object(TestingConfig())
app.json_encoder = JSONEncoder

client = MongoClient()
db = client.geojson_flask

geodata_collection = db.geodata

@app.route('/')
def index():
    return "Hello World!"

@app.route("/api/db", methods=["POST", "GET"])
def data():
    if request.method == "GET":
        data_cursor = geodata_collection.find()
        resp = []
        for data in data_cursor:
            resp.append(data)
        return jsonify(resp), 200
    
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


if __name__ == '__main__':
    app.run()