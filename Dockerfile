FROM python:3.6-alpine
MAINTAINER Fred Liang


RUN apk update && \
    apk add tzdata && \
    ls /usr/share/zoneinfo && \
    rm -rf /etc/localtime && \
    ln -s /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" >  /etc/timezone && \
    date  && \
    apk del tzdata

COPY requirements.txt /app/requirements.txt
WORKDIR /app

# -- Install dependencies:
RUN apk add --no-cache python-dev  libmagic mariadb-dev mariadb-client-libs gcc g++ make libffi-dev openssl-dev && \
    pip install -r requirements.txt && \
    apk del gcc g++ make libffi-dev openssl-dev && \
    rm -rf /var/cache/*  &&  \
    rm /app/requirements.txt

COPY . /app


ENTRYPOINT  python run.py