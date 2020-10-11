import os


basedir = os.path.abspath(os.path.dirname(__file__))

class Config(object):
    DEBUG = False
    TESTING = False
    CSRF_ENABLED = True
    STATIC_FOLDER = "client/dist"


class ProductionConfig(Config):
    DEBUG = False
    MONGODB_HOST = "mongodb-oceanhack.alwaysdata.net"


class StagingConfig(Config):
    DEVELOPMENT = True
    DEBUG = True


class DevelopmentConfig(Config):
    DEVELOPMENT = True
    DEBUG = True


class TestingConfig(Config):
    TESTING = True
    MONGODB_HOST = None
