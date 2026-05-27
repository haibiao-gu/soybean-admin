# 使用 Nginx 作为基础镜像
FROM nginx:alpine

RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

# 复制自定义的 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制已构建的静态文件到 nginx 目录
# 假设你的 dist 目录已经存在
COPY dist/ /usr/share/nginx/html/

# 暴露端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
