/**
 * Created by lance on 10/17/16.
 */
/*
var option = {
    tooltip: {
        trigger: 'axis'
    },
    toolbox: {
        feature: {
            dataView: {show: true, readOnly: false},
            magicType: {show: true, type: ['line', 'bar']},
            restore: {show: true},
            saveAsImage: {show: true}
        }
    },
    legend: {
        data:['蒸发量']
    },
    xAxis: [
        {
            type: 'category',
            data: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
        }
    ],
    yAxis: [
        {
            type: 'value',
            name: '水量',
            min: 0,
            interval: 50,
            axisLabel: {
                formatter: '{value} ml'
            }
        }
    ],
    series: [
        {
            name:'蒸发量',
            type:'bar',
            data:[2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3]
        }
    ]
};

var option1 = {
    title : {
        text: '某站点用户访问来源',
        x:'center'
    },
    tooltip : {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c} ({d}%)"
    },
    legend: {
        orient: 'vertical',
        left: 'left',
        data: ['直接访问','邮件营销','联盟广告','视频广告','搜索引擎']
    },
    series : [
        {
            name: '访问来源',
            type: 'pie',
            radius : '55%',
            center: ['50%', '60%'],
            data:[
                {value:335, name:'直接访问'},
                {value:310, name:'邮件营销'},
                {value:234, name:'联盟广告'},
                {value:135, name:'视频广告'},
                {value:1548, name:'搜索引擎'}
            ],
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }
    ]
};
*/
var groupOption = {
    title : {
        text: '人数统计',
        x:'center'
    },
    tooltip: {
        trigger: 'axis'
    },
    toolbox: {
        feature: {
            dataView: {show: true, readOnly: false},
            magicType: {show: true, type: ['line', 'bar']},
            restore: {show: true},
            saveAsImage: {show: true}
        }
    },
    legend: {
        data:['人数统计'],
        orient: 'vertical',
        left: 'left'
    },
    xAxis: [
        {
            type: 'category',
            data: []
        }
    ],
    yAxis: [
        {
            type: 'value',
            name: '人数',
            min: 0,
            interval: 2,
            axisLabel: {
                formatter: '{value} 人'
            }
        }
    ],
    series: [
        {
            name:'人数统计',
            type:'bar',
            data:[]
        }
    ]
};

var componentOption = {
    title : {
        text: '团队组成',
        x:'center'
    },
    tooltip : {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c} ({d}%)"
    },
    legend: {
        orient: 'vertical',
        left: 'left',
        data: []
    },
    series : [
        {
            name: '人数',
            type: 'pie',
            radius : '55%',
            center: ['50%', '60%'],
            data:[],
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }
    ]
};

var groupData = null;
var componentData = null;

function setGraphGroup(group) {
    if (groupData) {
        var years = [];
        var nums = [];
        for (var year in groupData[group]) {
            years.push(year);
            nums.push(groupData[group][year]);
        }
        groupOption.title.text = group + ' 人数统计';
        groupOption.xAxis[0].data = years;
        groupOption.series[0].data = nums;
        var groupChart = echarts.init(document.getElementById('graph-group'));
        groupChart.setOption(groupOption);
    }
}

function setGraphComponent(year) {
    if (componentData) {
        var groups = [];
        var data = [];
        for (var group in componentData[year]) {
            groups.push(group);
            data.push({value: componentData[year][group], name: group});
        }
        componentOption.title.text = year + ' 年团队组成';
        componentOption.legend.data = groups;
        componentOption.series[0].data = data;
        var componentChart = echarts.init(document.getElementById('graph-component'));
        componentChart.setOption(componentOption);
    }
}

$('#graph-group-select').on('change', function () {
    setGraphGroup($(this).val());
});

$('#graph-year-select').on('change', function () {
    setGraphComponent($(this).val());
});

$(function () {
    echarts.init(document.getElementById('graph-group'));
    echarts.init(document.getElementById('graph-component'));
    $.getJSON('/admin/summary/group', function(data) {
        if (data.status) {
            groupData = data.message;
            var html = '';
            var last_group;
            for (var group in groupData) {
                html = html + '<option>' + group + '</option>';
                last_group = group;
            }
            $('#graph-group-select').html(html);
            $('#graph-group-select').val(last_group);
            setGraphGroup(last_group);
        }
    });

    $.getJSON('/admin/summary/component', function(data) {
        if (data.status) {
            componentData = data.message;
            var html = '';
            var last_year;
            for (var year in componentData) {
                html = html + '<option>' + year + '</option>';
                last_year = year;
            }
            $('#graph-year-select').html(html);
            $('#graph-year-select').val(last_year);
            setGraphComponent(last_year);

        }
    });

});
