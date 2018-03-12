# Family Tree

## Structure

- **apidoc**：项目接口文档配置
- **application**：源码
- **doc**：项目接口文档
- **etc**：样例配置文件，包括**nginx**，**supervisor**，应用配置文件
- **scripts**：部署以及测试脚本


## Requirements

- Python3.6
- MySQL
- Redis
- Supervisor

## Building

除特殊声明外，以下目录均相对于**项目目录**，非系统目录

1. 将 **etc** 目录下的`web_config.conf`拷贝至 **application** 目录，作为应用配置文件
2. 在配置文件中设置MySQL用户名以及密码
3. 创建数据库`fmt`
4. 在根目录下利用 **virtualenv** 创建虚拟环境，并在虚拟环境下安装`requirements.txt`中的第三方库
5. 在根目录运行

``` python
python -m scripts.rebuild_db # 建立数据库表结构
python -m scripts.init # 插入初始化数据
```

6. 配置nginx、supervisor，配置文件可参考 **etc** 下的样例
7. 检查应用配置文件相关配置，应用启动文件为 `run.py`，最终部署改用supervisor拉起应用

## Deploy

可选部署方式：

1. git clone 项目后，将修改后的`/etc/`中配置文件`web_config.conf`文件放置到 `/etc/web_config.conf`，执行 docker compose
2. 将修改后的`/etc/`中配置文件`web_config.conf`文件放置到 `/etc/web_config.conf`，单独执行

``` shell
docker run  -P 23400:23400 registry.cn-hangzhou.aliyuncs.com/fredliang/fmt:latest -v /etc/web_config.conf:/app/application/web_config.conf
docker run redis:alpine -P 6739:6739
```

3. 直接通过`/etc/`中配置文件通过 nginx 和 supervisor 部署。

Change-Log
====

- 2016-10-18: [管理后台]后台管理系统支持报表
- 2016-10-03: [管理后台]后台管理系统支持邀请码管理（生成、查询、发送、删除）
- 2016-09-30: [管理后台]后台管理系统支持组的新建、删除、合并、拆分
- 2016-09-18: [后台]添加邮件支持，可以使用邮件发送邀请码、验证邮箱、重置密码等
