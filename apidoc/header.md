* 默认post数据采用form-data或者x-www-form-urlencoded，不要直接发送json格式的数据（即Content-Type为application/json）

1. 接口如果操作成功，则status为true，如果该接口需要返回数据，则可以在message中找到

2. 接口如果操作失败，则status为false，另外error中有失败的相关原因
