var univariate = new GRMlab();
univariate.module_name='univariate';
univariate.general_summary = true;

univariate.__tooltip_position = function(point, params, dom, rect, size, align){

    // recursive function to check for offset
    function recursive_parent_search(value, element, type){
        let result = 0;
        if (value.offsetParent) {
            switch(type){
                case "sum":
                    if (value.offsetParent.className != "tooltip_fix"){
                        result += value.offsetParent[element];
                    }
                    result += recursive_parent_search(value.offsetParent, element, "sum");
                    break;
                case "max":
                    if (value.offsetParent.className != "tooltip_fix"){
                        result = Math.max(result, value.offsetParent[element]);
                    }
                    result = Math.max(result, recursive_parent_search(value.offsetParent, element, "max"));
                    break;
            }
        }
        else if (value.parentElement) {
            switch(type){
                case "sum":
                    if (value.parentElement.className != "tooltip_fix"){
                        result += value.parentElement[element];
                    }
                    result += recursive_parent_search(value.parentElement, element, "sum");
                    break;
                case "max":
                    if (value.parentElement.className != "tooltip_fix"){
                        result = Math.max(result, value.parentElement[element]);
                    }
                    result = Math.max(result, recursive_parent_search(value.parentElement, element, "max"));
                    break;
            }
        };
        return result;
    };

    let x_distance_point = 20;
    
    let fix_V_tooltip = 0
    let extra_dist_H = 0
    let extra_dist_V = 0

    if (!("offsetParent" in dom) || (dom.offsetParent==null)){
        return [0,0]
    }

    if (dom.offsetParent.className == "tooltip_fix"){
        extra_dist_H = (dom.parentElement)?(dom.offsetParent.parentElement.clientWidth - size.viewSize[0]) / 2 + 5:0; //nedded because of margin
        extra_dist_V = (dom.parentElement)?(dom.offsetParent.parentElement.clientHeight - size.viewSize[1]) / 2 + 5:0; //nedded because of margin

        fix_V_tooltip = (dom.offsetParent.parentElement.offsetTop - dom.offsetParent.offsetTop);
    }
    else{
        extra_dist_H = (dom.parentElement)?(dom.offsetParent.clientWidth - size.viewSize[0]) / 2 + 5:0; //nedded because of margin
        extra_dist_V = (dom.parentElement)?(dom.offsetParent.clientHeight - size.viewSize[1]) / 2 + 5:0; //nedded because of margin
    }

    let cont_width=size.contentSize[0];
    let cont_height=size.contentSize[1];

    // check space in the left of the mouse
    let left_space = point[0] + recursive_parent_search(dom, "offsetLeft", "sum");
    let top_space = point[1] + recursive_parent_search(dom, "offsetTop", "sum");

    let right_space = recursive_parent_search(dom, "offsetWidth", "max") - left_space;
    let bottom_space = recursive_parent_search(dom, "offsetHeight", "max") - top_space;


    if (params.componentType =='legend') {
        if (rect.x+15+cont_width > (size.viewSize[0]+100)) {
            return [rect.x-cont_width+20, point[1]-cont_height];
        }
        return [rect.x+15, point[1]-cont_height];
    }

    // determina X pos of tootltip
    let x_pos = point[0] + x_distance_point;
    switch(align){
        case "left":
            x_pos = - cont_width - x_distance_point;
            break;
        case "right":
            x_pos = size.viewSize[0] + x_distance_point;
            break
        default:
            if (point[0] <= size.viewSize[0] / 2){
                if (cont_width + x_distance_point + extra_dist_H < right_space) {
                    x_pos = point[0] + x_distance_point;
                }
                else if (right_space < left_space) {
                    x_pos = point[0] - x_distance_point - cont_width;
                }
                else {
                    x_pos = point[0] + x_distance_point;
                };
            }
            else {
                if (cont_width + x_distance_point + extra_dist_H < left_space){
                    x_pos = point[0] - x_distance_point - cont_width;
                }
                else if (right_space < left_space) {
                    x_pos = point[0] - x_distance_point - cont_width;
                }
                else {
                    x_pos = point[0] + x_distance_point;
                };
            };
    };

    // determina Y pos of tootltip
    let default_shift = (point[1] / size.viewSize[1]) * cont_height;
    let y_pos = point[1] - default_shift + fix_V_tooltip;
    if (default_shift + extra_dist_V > top_space){
        if (cont_height - default_shift + top_space + extra_dist_V > bottom_space){
            y_pos += (top_space + bottom_space - cont_height) / 2;
        }
        else {
            y_pos += (default_shift - top_space + extra_dist_V);
        };
    }
    else if (cont_height - default_shift + extra_dist_V > bottom_space){
        if (cont_height - bottom_space - extra_dist_V > top_space){
            y_pos += (top_space + bottom_space - cont_height) / 2;
        }
        else {
            y_pos -= (cont_height - default_shift + extra_dist_V - bottom_space );
        };
    };

    return [x_pos, y_pos];
};

//------------------------------------------------------------------------
// CATEGORICAL AND NOMINAL
//------------------------------------------------------------------------

// graphs
univariate.__categorical_graph_histogram = function(v_data){
    // data used for the gaph
    let informed=v_data['informed records'];
    let informed_cat=v_data['categories'];
    let hist_info_col=v_data['hist_info_col'];
    let hist_info_pos=v_data['hist_info_pos'];
    let top10_count=v_data['hist_info_col'].slice().reduce((a, b) => a + b, 0);
    let others_count=informed-top10_count;
    let serie_data= []
    let serie_label= []

    // Prepare series
    for (let i = 0; i < hist_info_col.length; i++) {
        serie_data.push({value:hist_info_col[i]/informed,itemStyle:{color:'#49a5e6'}});
        serie_label.push(hist_info_pos[i]);
    }
    // Add 'Others' category
    if (others_count>0) {
        serie_data.push({value:others_count/informed,itemStyle:{color:'#a9a9a9'}});
        serie_label.push('Others');
    }

    var entropy_bucket = [];
    for (i = 0; i < serie_data.length; i++) {
        entropy_bucket.push(-serie_data[i].value * Math.log(serie_data[i].value));
    };

    // Create chart
    let options = {
        tooltip: {
            trigger: 'axis',
            position: function (point, params, dom, rect, size) {
                return this.univariate.__tooltip_position(point, params, dom, rect, size);
            },
            formatter: function(params){
                let html = '';
                let tooltip_title = "Category:"
                let group_name = "'"+params[0].name+"'";
                if (params[0].name == 'Others') {
                    tooltip_title = "Others:"
                    group_name = fmt_int.format(informed_cat-10);
                    group_name +='<span class="i"> distinct values</span>';
                }

                html += "<div class='tooltip'>";
                html += "<div><table>";
                html += "<tr>";
                html += "<td class='u blue_labels'>" + tooltip_title + "</td>";
                html += "<td class='center value'>&nbsp;";
                html += group_name + '</td>';
                html += "</tr><tr><td></td><td></td></tr><tr><td></td><td></td></tr><tr><td></td><td></td></tr>";
                html += "<tr>";
                html += "<td class='i blue_labels'>Percentage:</td>";
                html += "<td class='right value'>";
                html += fmt_dec_max1.format(params[0].value*100)+"%"+'</td>';
                html += "</tr>";
                html += "<tr>";
                html += "<td class='i blue_labels'>Records:</td>";
                html += "<td class='right value'>";
                html += fmt_int.format(params[0].value*informed)+"</td>";
                html += "</tr>";
                html += "<tr><td></td><td></td></tr><tr><td></td><td></td></tr><tr><td></td><td></td></tr>";
                html += "<tr>";
                html += "<td class='i blue_labels'>Entropy:</td>";
                html += "<td class='right value'>";
                html += fmt_dec_max3.format(params[1].value) + ' bits' +"</td>";
                html += "</tr>";
                html += "</table></div>";
                return html;
            },
            extraCssText: ec_tooltip,
        },
        grid: {left: '3%',right: '8%',bottom: 15,top:5,containLabel: true},
        yAxis: [{
            type: 'value',
            axisLine: {show:false,lineStyle: {color:color_background_1}},
            splitLine: {show: true,lineStyle: {color: '#455678'}},
            axisLabel: {
                margin:2,interval: 0,color:'#8999b9',fontSize: 10,
                formatter: function(x){ return fmt_int.format(x*100)+'%';}
            },
            max: 1,
            splitNumber: 5,
        },{
            splitLine: {show: false,lineStyle: {etype:'dotted',color: '#ea923466'}},
            axisTick: {show: true,lineStyle: {color: '#ea9234'}},
            name: "Information capacity [bits]",
            nameLocation: "middle",
            nameRotate: 270,
            nameGap: 30,
            axisLabel: {
                interval: 0,color:'#ea9234',fontSize: 10,
                formatter: function(x){return fmt_dec_max2.format(x);}
            },
            axisLine: {show:true,lineStyle: {color:'#ea9234', type: "dashed"}},
            type: 'value',scale:true,
            min: 0,
            max: Math.exp(-1) / ((1/2) * Math.log(2)),
            splitNumber: 5,
        }
        ],
        xAxis: {
            axisPointer:{
                type:'shadow',z:0,
                shadowStyle:{color:'rgba(150,150,150,0.1)'},
            },
            type: 'category',
            data: serie_label,
            axisLabel: {
                // Backlog: Add tooltip (not currently supported by eCharts)
                rotate:45,show:true,color:'#8999b9',fontSize: 10,
                interval:0,
                formatter: function(x){
                    if (x == 'Others') return x;
                    else {
                        if (x.length>7) return ""+x.substring(0,5)+"...";
                        else return "'"+x+"'";
                    }
                }
            },
            axisLine: {show:false,lineStyle: {color:'#455678'}},
        },
        series: [
            {
                name:'',type:'bar',
                data: serie_data,barMaxWidth: 25,
            },
            {
                yAxisIndex: 1,
                name:'',
                type:'line',
                data: entropy_bucket.map(function(value){return value / ((1/2)*Math.log(2))}),
                //data: entropy_bucket.map(function(value){return value / Math.exp(-1)}),
                color: '#ea9234',
            }
        ]
    };
    return options;
};
univariate.__categorical_graph_temporal_info = function(v_data){

    let months = v_data['dates'].length;
    let months_no_info = v_data['months w/o information'];

    let informed, missing, special;
    informed=v_data['informed records'];
    missing=v_data['missing records'];
    special=v_data['special records'];        

    let total = informed + missing + special;

    var series = [];
    var legend_labels = [];

    // Markareas months without info
    let non_informed= [];
     if (months_no_info > 0) {
        let non_informed_status= 'closed';
        let non_informed_initial= 0;
        let non_informed_i= 0;

        for (let month_value of v_data['temp_info']) {
            if (month_value == 0) {
                if (non_informed_status=='closed') {
                    non_informed_status= 'open';
                    non_informed_initial= non_informed_i;
                }
            }
            else if (non_informed_status=='open') {
                non_informed.push([
                    {
                        itemStyle:{color:'url(#texture-1) #102f54',origin:'start'},
                        xAxis: Math.max(non_informed_initial-1,0)
                    },
                    {xAxis: non_informed_i}
                ]);
                non_informed_status= 'closed';
            }
            non_informed_i+=1;
        }
        if (non_informed_status=='open') {
            non_informed.push([
                {
                    itemStyle:{color:'url(#texture-1) #102f54',origin:'start'},
                    xAxis: non_informed_initial-1
                },
                {xAxis: non_informed_i}
            ]);
            non_informed_status= 'closed';
        }
     }

    // Series
    // -------------------------------------------------------------------------
    series.push({
        type:'line',name:'informed',symbol:'none',
        data: v_data['temp_info'],lineStyle: {color: '#49a5e6'}
    });
    series.push({
        type:'line',name:'missing',symbol:'none',
        data: v_data['temp_missing'],lineStyle: {color: '#e65068'}
    });
    series.push({
        type:'line',name:'special',symbol:'none',
        data: v_data['temp_special'],lineStyle: {color: '#ea9234'}
    });
    // Markarea 100% non informed
    if (non_informed.length > 0) {
        series.push(
            {
                type:'line',name:'No information',data: null,
                markArea: {silent: true,data: non_informed,},
                itemStyle:{color:'url(#texture-1) #102f54'},
            }
        );
    }
     // Markarea 100% informed
    if (informed == total) {
        series.push(
            {
                type:'line',name:'#null#',data: null,
                markArea: {
                    silent: true,
                    data:[[{itemStyle: {color: '#49a5e616'},
                            name:'100% informed',xAxis: 0,show:true,
                            label:{color: '#49a5e6',position:'inside',}},
                            {xAxis: months-1}]]
                },
            }
        );
    }

    // Legend labels
    // -------------------------------------------------------------------------
    legend_labels.push({name:'informed'});
    legend_labels.push({name:'missing'});
    legend_labels.push({name:'special'});
    if (non_informed.length > 0) {
            legend_labels.push({name:'No information',icon:'rect',textStyle:{color:'#67799c'}});
    }

    // -------------------------------------------------------------------------
    // Echart object
    let options = {
        tooltip: {
            position: function (point, params, dom, rect, size) {
                return this.univariate.__tooltip_position(point, params, dom, rect, size);
            },
            trigger: 'axis',
            formatter: function(params){
                let html = '';
                html += "<div class='tooltip'>";
                html += "<span class='blue_labels'>Date:</span>";
                html += "<span class='f12'>&nbsp;"+params[0].name+"</span>";
                html += "<div>";
                html += "<table>";
                for (let item of params) {
                    html+="<tr>";
                    html+="<td class='blue_labels'>";
                    html+='<span class="element" style="color:'+item.color+'">&#x25b0;</span> ';
                    html+='<span class="i">'+item.seriesName+':</span></td>';
                    html+="<td class='right value'>";
                    html+=fmt_dec_max1.format(item.value*100)+"%"+'</td>';
                    html+="</tr>";
                }
                html += "</table>";
                html += "</div>";
                return html;
            },
            extraCssText: ec_tooltip,
        },
        legend: {
            inactiveColor:'#57698c',
            symbolKeepAspect:true,itemHeight:10,itemWidth:13,
            icon:'path://M20,25 100,25 80,75 0,75z', bottom:'0',
            textStyle: {
                padding:[0, 4, 0, -3],
                align:'left',
                color: '#8999b9',
                fontSize: 10,
            },
            data:legend_labels,
            itemGap:2,
        },
        grid: {left:  '40',right: '15',bottom:'40',top:   '10',},
        xAxis: {
            type: 'category',
            axisLabel: {color:'#8999b9',fontSize: 10},
            axisLine: {
                symbol: ['none', 'arrow'],
                symbolOffset:[0, 8],
                symbolSize:[6, 10],
                lineStyle: {color:'#8999b9'}
            },
            boundaryGap: false,
            data: v_data['dates']
        },
        yAxis: {
            splitLine: {show: true,lineStyle: {color: '#455678'}},
            type: 'value',
            axisLabel: {
                fontSize: 10,
                fontFamily: 'open sans',
                color:'#8999b9',
                formatter: function(x){ return fmt_dec_max1.format(x*100)+'%';}
            },
            axisLine: {lineStyle: {color:'#8999b9'}}
        },
        color:['#49a5e6','#e65068','#ea9234', '#e65068','#f6cb51'],
        animationDuration: 300,
        series: series
    };
    
    return options;
};
univariate.__categorical_graph_temporal_dist = function(v_data){

    let months = v_data['dates'].length;
    let months_no_info = v_data['months w/o information'];
    var data_list = ['temp_c0','temp_c1','temp_c2','temp_c3','temp_c4',
                     'temp_c5','temp_c6','temp_c7','temp_c8','temp_c9'];
    var series = [];
    var labels = [];

    // Markareas months without info
    let non_informed= [];
     if (months_no_info > 0) {
        let non_informed_status= 'closed';
        let non_informed_initial= 0;
        let non_informed_i= 0;

        for (let month_value of v_data['temp_info']) {
            if (month_value == 0) {
                if (non_informed_status=='closed') {
                    non_informed_status= 'open';
                    non_informed_initial= non_informed_i;
                }
            }
            else if (non_informed_status=='open') {
                non_informed.push([
                    {
                        itemStyle:{color:'url(#texture-1) #102f54',origin:'start'},
                        xAxis: Math.max(non_informed_initial-1,0)
                    },
                    {xAxis: non_informed_i}
                ]);
                non_informed_status= 'closed';
            }
            non_informed_i+=1;
        }
        if (non_informed_status=='open') {
            non_informed.push([
                {
                    itemStyle:{color:'url(#texture-1) #102f54',origin:'start'},
                    xAxis: non_informed_initial-1
                },
                {xAxis: non_informed_i}
            ]);
            non_informed_status= 'closed';
        }
     }

    // Exclude series with length == 0
    for (let element in data_list) {
        var data_series = v_data[data_list[element]];
        if (data_series.length != 0) {
            series.push(
                {
                    //showAllSymbol:true,symbolSize:2,symbolKeepAspect:true,symbol:'rect',
                    name: v_data.top_cat[element],
                    data: data_series,
                    symbol:'none',type:'line',hoverAnimation:false,
                },
            );
            // Warning: ''+ it's necessary
            labels.push({name: ''+v_data.top_cat[element]});
        }
    }
    // If 'Others' exists
    if (! v_data['temp_rest'].every(x => x == 0)) {
        series.push(
            {
                name: 'Others',
                data: v_data['temp_rest'],
                symbol:'none',type:'line',hoverAnimation:false,
                color: '#a9a9a9',
            }
        );
        labels.push({name: 'Others'});
    }

    // Add a serie with areas for Months non-informed
     if (non_informed.length > 0) {
        series.push({
                    type:'line',name:'No information',symbol:'none',data: null,
                    markArea: {silent: true,data: non_informed,},
                    itemStyle:{color:'url(#texture-1) #102f54'}
            });
        labels.push({name:'No information',icon:'rect',textStyle:{color:'#57698c'}});
     }

    // Create chart;
    let options = {
        tooltip: {
            position: function (point, params, dom, rect, size) {
                return this.univariate.__tooltip_position(point, params, dom, rect, size);
            },
            trigger: 'axis',
            formatter: function(params){
                let html = '';
                html += "<div class='tooltip'>";
                html += "<span class='blue_labels'>Date:</span>";
                html += "<span class='f12'>&nbsp;"+params[0].name+"</span>";
                html += "<div>";
                html += "<table>";
                for (let item of params) {
                    let group_name = "'"+item.seriesName+"'";
                    if (item.seriesName == 'Others') group_name = 'Others';

                    html+="<tr style='vertical-align: top;'>";
                    html+='<td class="element" style="color:'+item.color+'">&#x25b0;</td> ';
                    html+="<td class='blue_labels'>";
                    html+='<span class="i">'+group_name+':</span></td>';
                    html+="<td class='right value'>";
                    if (typeof item.value == "undefined") html+= '-';
                    else html+=fmt_dec_max1.format(item.value*100)+"%";
                    html+="</td></tr>";
                }
                html += "</table>";
                html += "</div></div>";
                return html;
            },
            extraCssText: ec_tooltip,
        },
        legend: {
            tooltip: {
                triggers: 'item',
                show:true,
                formatter: function(params){
                    if (params.name.length <= 7) return;
                    if (params.name == 'No information') return;
                    let html = '';
                    html += "<div class='tooltip_2'>";
                    html += "<div class='f10 i'>'"+params.name+"'</div>";
                    html += "<div>";
                    return html;
                },
            },
            inactiveColor:'#57698c',
            textStyle: {
                padding:[0, 4, 0, -3],
                align:'left',
                color: '#8999b9',
                fontSize: 10,
            },
            symbolKeepAspect:true,itemHeight:10,itemWidth:13,
            icon:'path://M20,25 100,25 80,75 0,75z', bottom:'0',itemGap:2,
            data:labels,
            formatter: function(x){
                if (x == 'Others') return x;
                else if (x == 'No information') return x;
                else {
                    if (x.length>7) return ""+x.substring(0,5)+"...";
                    else return "'"+x+"'";
                }
            }
        },
        grid: {left:  '40',right: '15',bottom:'57',top:   '10',},
        xAxis: {
            type: 'category',
            axisLabel: {color:'#8999b9',fontSize: 10,},
            axisLine: {
                symbol: ['none', 'arrow'],
                symbolOffset:[0, 8],
                symbolSize:[6, 10],
                lineStyle: {color:'#8999b9'}
            },
            boundaryGap: false,
            data: v_data['dates']
        },
        yAxis: {
            type: 'value',
            scale:true,
            axisLabel: {
                color:'#8999b9',
                fontSize: 10,
                formatter: function(x){ return fmt_dec_max1.format(x*100)+'%';}
            },
            splitLine: {show: true,lineStyle: {color: '#455678'}},
            axisLine: {lineStyle: {color:'#8999b9'}}
        },
        acolor:[
            '#0074D9','#7FDBFF','#3D9970','#FFDC00','#FF851B','#2ECC40','#01FF70',
            '#85144b','#F012BE','#B10DC9','#111111','#AAAAAA','#DDDDDD'
        ],
        color:[
            '#175da4','#49a5e6','#2dcccd','#d8be75','#f35e61','#61d178','#ac6f2e','#dfff54','#ff53a5','#006568'
        ],
        animationDuration: 300,
        series: series,
    }
    
    return options;
};

// boxes
univariate.__categorical_information_box = function(v_data){

    let informed, missing, special;
    informed=v_data['informed records'];
    missing=v_data['missing records'];
    special=v_data['special records'];        

    let total = informed + missing + special;
    let informed_perc=(informed/total);
    let missing_perc=(missing/total);
    let special_perc=(special/total);

    let asses_missing_perc = asses_univariate('missing_perc',[missing_perc]);

    let html = '';
    html += '<div><h1 class="block_subtitle">Information level</h1></div>';
    html += this.__information_level(missing,special,informed,missing_perc,special_perc,informed_perc);
    return {html: html, graphs: ''};
};

univariate.__categorical_distribution_box = function(v_data){

    // HHI data
    let special_list=v_data['unique special values'];
    let special_catnum=special_list.length;
    let informed=v_data['informed records'];
    let informed_cat=v_data['categories'];
    let missing=v_data['missing records'];
    let special;
    special=v_data['special records'];        

    let total = informed + missing + special;
    let informed_perc=(informed/total);
    let missing_perc=(missing/total);
    let special_perc=(special/total);
    let HHI,HHI_norm;
    if (v_data.version == '01') {
        HHI=v_data['HHI'];
        HHI_norm=v_data['HHI (normalized)'];
    }
    else if (v_data.version == '02') {
        HHI=v_data['d_HHI'];
        HHI_norm=v_data['d_HHI_norm'];
    }      


    // Entropy
    let serie_data = v_data['hist_info_col'].map(function(value){ return value / informed });
    let entropy_bucket = [];
    for (i = 0; i < serie_data.length; i++) {
        entropy_bucket.push(-serie_data[i] * Math.log(serie_data[i]));
    };
    let entropy_informed = entropy_bucket.reduce(function(a, b){return a + b});
    let entropy_all = 0
    if (missing_perc == 0){
        if (special_perc == 0){
            entropy_all = entropy_bucket.reduce(function(a, b){return a + b});
        }
        else{
            entropy_all = entropy_bucket.reduce(function(a, b){return a + b}) * informed_perc - informed_perc * Math.log(informed_perc) - 
                    special_perc * Math.log(special_perc);
        }
    }
    else if (special_perc == 0){
        entropy_all = entropy_bucket.reduce(function(a, b){return a + b}) * informed_perc - informed_perc * Math.log(informed_perc) - 
                missing_perc * Math.log(missing_perc);
    }
    else{
        entropy_all = entropy_bucket.reduce(function(a, b){return a + b}) * informed_perc - informed_perc * Math.log(informed_perc) - 
                missing_perc * Math.log(missing_perc) - special_perc * Math.log(special_perc);
    };

    // plots
    let chart = this.echarts_prepare_chart(this.__categorical_graph_histogram(v_data),{});

    // Show, if any, the special categories
    let special_li = '';
    if (special_catnum > 0) {
        special_li += '<div class="tooltip icon_ellipsis-h">';
        special_li += '<span class="tooltiptext left">';
        special_li += '<span class="value_small">Values: </span>';
        special_li += special_list.join(", ")+'</span></div>';
    }

    let html = '';
    html += '<div><h1 class="block_subtitle">Categories</h1></div>';

    // Number of special and informed categories
    html += '<div class="block_table_2">';
    html += '<table style="width:75%;margin:10px 0px 20px 0px;">';
    html += '<tr><td style="text-align:center;">Specials</td><td class="center">Informed</td></tr>';
    html += '<tr class="s_m"><td style="text-align:center;" class="center value">'+fmt_num(special_catnum,'0') + special_li + '</td>';
    html += '<td class="center value">'+fmt_num(informed_cat,'0')+'</td></tr>';
    html += '<tr><td style="text-align:center;">categories</td><td class="center">categories</td></tr>';
    html += '</table>';

    // Entropy: Information capacity.
    html += '<table style="width:75%;margin:10px 0px 20px 0px;">';
    html += '<tr><td colspan="4" style="text-align:center;">Information capacity</td></tr>';
    html += '<tr><td style="text-align:right;">informed: </td><td class="value left">';
    html += fmt_dec_max2.format(entropy_informed / (Math.log(2)/2)) + ' bits</td>';
    html += '<td style="text-align:right;">all: </td><td class="value left">';
    html += fmt_dec_max2.format(entropy_all / (Math.log(2) / 2)) +' bits</td></tr>';
    html += '</table>';
    html += '</div>';

    // graph
    html += chart.html;

    return {html: html, graphs: chart};
};
univariate.__categorical_temporal_information_box_v01 = function(v_data){

    // info
    let info_stability = v_data['information stability (evenly)'];
    let info_stability_w = v_data['information stability (weighted)'];
    let months = v_data['dates'].length;
    let months_no_info = v_data['months w/o information'];
    let informed_months = months - months_no_info;
    let assesment_months = asses_months_no_info(months,informed_months);
    let assesment_stability = asses_stability(info_stability,info_stability_w);

    // plots
    let chart = this.echarts_prepare_chart(this.__categorical_graph_temporal_info(v_data),{});

    // HTML
    let html = '';
    html += '<div><h1 class="block_subtitle">Temporal analysis</h1></div>';

    html += '<div class="block_table_2">';
    html += '<table style="width:88%;">';
    html += '<tr><td>Informed months: ';
    html += '<span class="value ' + assesment_months + '">' + fmt_num(informed_months);
    html += ' / ' + fmt_num(months) + '</span>';
    html += '</td>';
    html += '<td>Information stability:</td>';
    html += '<td>';
    html += '<span class="value ' + assesment_stability + '">' + fmt_num(info_stability,'4');
    html += '</span>';
    html += '<span class="value_small"> (global)</span></td>';
    html += '<td>';
    html += '<span class="value ' + assesment_stability + '">' + fmt_num(info_stability_w,'4');
    html += '</span>';
    html += '<span class="value_small"> (weighted)</span></td>';
    html += '</tr>';
    html += '</table>';
    html += '</div>';

    // Chart
    html += chart.html;

    return {html: html, graphs: chart};
};
univariate.__categorical_temporal_information_box_v02 = function(v_data){

    // info
    let info_stability = v_data['information divergence (uniform)'];
    let info_stability_w = v_data['information divergence (exponential)'];
    let months = v_data['dates'].length;
    let months_no_info = v_data['months w/o information'];
    let informed_months = months - months_no_info;
    let assesment_months = asses_months_no_info(months,informed_months);
    let assesment_stability = asses_stability(info_stability,info_stability_w);

    // plots
    let chart = this.echarts_prepare_chart(this.__categorical_graph_temporal_info(v_data),{});

    // HTML
    let html = '';
    html += '<div><h1 class="block_subtitle">Temporal analysis</h1></div>';

    html += '<div class="block_table_2">';
    html += '<table style="width:88%;">';
    html += '<tr><td>Informed months: ';
    html += '<span class="value ' + assesment_months + '">' + fmt_num(informed_months);
    html += ' / ' + fmt_num(months) + '</span>';
    html += '</td>';
    html += '<td>Divergence:</td>';
    html += '<td>';
    html += '<span class="value ' + assesment_stability + '">' + fmt_num(info_stability,'4');
    html += '</span>';
    html += '<span class="value_small"> (uniform)</span></td>';
    html += '<td>';
    html += '<span class="value ' + assesment_stability + '">' + fmt_num(info_stability_w,'4');
    html += '</span>';
    html += '<span class="value_small"> (exponential)</span></td>';
    html += '</tr>';
    html += '</table>';
    html += '</div>';

    // Chart
    html += chart.html;

    return {html: html, graphs: chart};
};
univariate.__categorical_temporal_distribution_box_v01 = function(v_data){

    // info
    let informed=v_data['informed records'];
    let data_stability=v_data['data values stability (evenly)'];
    let data_stability_w=v_data['data values stability (weighted)'];
    let assesment = asses_stability(data_stability,data_stability_w);

    // plots
    let chart = this.echarts_prepare_chart(this.__categorical_graph_temporal_dist(v_data),{});

    // HTML
    let html = '';

    html += '<div class="block_table_2">';
    html += '<table style="width:88%;">';
    html += '<tr><td>Informed records: ';
    html += '<span class="value">' + fmt_num(informed) + '</span>';
    html += '</td>';
    html += '<td>Values stability:</td>';
    html += '<td>';
    html += '<span class="value ' + assesment + '">' + fmt_num(data_stability,'4') + '</span>';
    html += '<span class="value_small"> (global)</span></td>';
    html += '<td>';
    html += '<span class="value ' + assesment + '">' + fmt_num(data_stability_w,'4') + '</span>';
    html += '<span class="value_small"> (weighted)</span></td>';
    html += '</tr>';
    html += '</table>';
    html += '</div>';

    // Chart
    html += chart.html;

    return {html: html, graphs: chart};
};
univariate.__categorical_temporal_distribution_box_v02 = function(v_data){

    // info
    let informed=v_data['informed records'];
    let data_stability=v_data['data values divergence (uniform)'];
    let data_stability_w=v_data['data values divergence (exponential)'];
    let assesment = asses_stability(data_stability,data_stability_w);

    // plots
    let chart = this.echarts_prepare_chart(this.__categorical_graph_temporal_dist(v_data),{});

    // HTML
    let html = '';

    html += '<div class="block_table_2">';
    html += '<table style="width:88%;">';
    html += '<tr><td>Informed records: ';
    html += '<span class="value">' + fmt_num(informed) + '</span>';
    html += '</td>';
    html += '<td>Divergence:</td>';
    html += '<td>';
    html += '<span class="value ' + assesment + '">' + fmt_num(data_stability,'4') + '</span>';
    html += '<span class="value_small"> (uniform)</span></td>';
    html += '<td>';
    html += '<span class="value ' + assesment + '">' + fmt_num(data_stability_w,'4') + '</span>';
    html += '<span class="value_small"> (exponential)</span></td>';
    html += '</tr>';
    html += '</table>';
    html += '</div>';

    // Chart
    html += chart.html;

    return {html: html, graphs: chart};
};

//------------------------------------------------------------------------
// NUMERICAL AND ORDINAL 
// the temporal information and modal function is the same as for categoricals
//------------------------------------------------------------------------

// graphs
univariate.__numerical_graph_histogram = function(v_data){

    // distribution data
    let informed=v_data['informed records'];
    let minVal=v_data['min'];
    let mean=v_data['mean'];
    let mode=v_data['mode'];
    let maxVal=v_data['max'];
    let std=v_data['std'];
    let P1=v_data['percentile 1%'];
    let P25=v_data['percentile 25%'];
    let median=v_data['median'];
    let P75=v_data['percentile 75%'];
    let P99=v_data['percentile 99%'];

    let hist_info_col=v_data['hist_info_col'];
    let hist_info_pos=v_data['hist_info_pos'];
    let outliers_high=v_data['outliers high'];
    let outliers_low=v_data['outliers low'];
    let outliers_high_threshold=v_data['outlier high threshold'];
    let outliers_low_threshold=v_data['outlier low threshold'];

    // Prepare data series
    let serie_label = [];
    let serie_data = [];
    let groups = [];
    let outliers_low_perc=(outliers_low)/informed;
    let outliers_high_perc=(outliers_high)/informed;

    // Create the array of valid groups (>0)
    let value;
    for (let i = 0; i < hist_info_col.length; i++) {
        if (hist_info_col[i]>0) {
            value=hist_info_col[i]/informed;
            groups.push({axis_label:hist_info_pos[i],value:value});
        }
    }
    // Include outliers
    groups.unshift({axis_label:outliers_low_threshold,value:outliers_low_perc});
    groups.push({axis_label:outliers_high_threshold,value:outliers_high_perc});

    let group_label;
    // Iterate through groups
    for (let i = 1; i < groups.length-1; i++) {
        //group_label = fmt_num(groups[i-1].axis_label) + ' , ' + fmt_num(groups[i].axis_label);
        group_label = get_interval_desc(fmt_num(groups[i-1].axis_label),fmt_num(groups[i].axis_label));
        // v19 serie_data.push({value:(groups[i].value),itemStyle:{color:'#49a5e6'}});
        serie_data.push({value:(groups[i].value),itemStyle:{color:'#028484'}});
        serie_label.push({value:group_label});
    };

    // Include outliers
    group_label = '< ' + fmt_num(groups[0].axis_label);
    serie_data.unshift({name:'threshold',value:''});
    serie_label.unshift({value:'',});
    serie_data.unshift({value:groups[0].value,itemStyle:{color:'#a9a9a9'}});
    serie_label.unshift({value:group_label});
    group_label = '> ' + fmt_num(groups[groups.length-1].axis_label);
    serie_data.push({name:'threshold',value:''});
    serie_label.push({value:''});
    serie_data.push({value:groups[groups.length-1].value,itemStyle:{color:'#a9a9a9'}});

    serie_label.push({value:group_label});

    let minOutlier = Math.max(minVal,outliers_low_threshold);
    let maxOutlier = Math.min(maxVal,outliers_high_threshold);

    //Image Parameters
    var margins = 5;
    var vertical_margins = 13;
    var distance_L_S = 10;
    var distance_S_G = 16;

    var short_line_margin = margins + 15;
    var short_line_vertical_margins = distance_L_S + vertical_margins;
    var bar_plot_vertical_margin = short_line_vertical_margins + distance_S_G + '%';
    var bar_plot_vertical_margin_bottom = '5%';

    var width_short_line = 5;
    var width_long_line = 2;

    var size_circles_short = 10;
    var size_circles_long = 10;
    var min_max_size = 30;

    //var bar_right = 15;
    var bar_right = 1;
    var bar_left = 10;

    var character_size = 12;
    var character_toolkit_size = 12;

    //BP colors
    var colorAxisLong = "#1464A5";
    var colorAxisShort = "#49A5E6";

    var colorP1 = "#2DCCCD";
    var colorP25 = "#028484";
    var colorMean = "#AD53A1";
    var colorMedian = "#F7893B";
    var colorMaxMin = "#EEEEEE";

    var  color_background_1 = '#0a213c';

    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    //--- Functions to treat Data

    var data_range = [ 
        [minVal, "Min", colorMaxMin], 
        [maxVal, "Max", colorMaxMin] ];

    var data_corto = [];
    var data_largo = [];

    var data_P = [
        [P1, "P1", colorP1],
        [P25, "P25", colorP25],
        [median, "Median", colorMedian],
        [P75, "P75", colorP25],
        [P99, "P99", colorP1]
    ];
    var media = [mean, "Mean", colorMean];

    var data_all = [];

    //locate the Mean
    var flag_mean = true;
    for (i = 0; i < data_P.length; i++){
        if ( data_P[i][0] > mean && flag_mean ){
            data_all.push(media);
            data_all.push(data_P[i]);
            flag_mean = false;
        }
        else{
            data_all.push(data_P[i]);
        }
    }

    //Join equal values
    for (i = 0; i < data_all.length; i++){
        if (i < (data_all.length - 1)){
            if (data_all[i][0] == data_all[i+1][0]){
                data_all[i+1][1] = data_all[i][1] +", "+ data_all[i+1][1];
                continue;
            }
        }
        if (data_all[i][0] >= minOutlier && data_all[i][0] <= maxOutlier ){
            data_corto.push(data_all[i]);
        } else {
            data_largo.push(data_all[i]);
        }
    }


    //--- Image
    var option = {
        tooltip: {},//{ position: 'bottom',},
        singleAxis: [],
        grid: [{
            top: '0%',
            bottom: '0%',
            left: '0%',
            right: '0%',
            containLabel: false
        }],
        xAxis: [],
        yAxis: [],
        series: []
    };

    // option.tooltip.push({
    //         position: 'bottom',
    // });

    option.singleAxis.push({
        left: margins + '%',
        right: margins + '%',
        type: 'value',
        boundaryGap: false,
        top: vertical_margins + '%',
        height: 0 + '%',
        min: minVal,
        max: maxVal,
        axisLabel: [{
            show: false
        }],
        axisTick: [{
            show: false
        }],
        axisLine: {
            lineStyle: {
                color: colorAxisLong,
                width: width_long_line
            }
        }
    });
    echarts.util.each( data_largo, function (dataItem2){
        option.series.push({
            symbolSize: size_circles_long,
            coordinateSystem: 'singleAxis',
            symbol: "triangle",
            symbolRotate: 180,
            symbolOffset: [0, -3],
            type: 'scatter',
            data: [dataItem2[0]],
            name: dataItem2[1],
            color: dataItem2[2],
            label: {
                show: true,
                position:[-10, -15], 
                rotate: 0, 
                fontSize: character_size,
                color: dataItem2[2],
                formatter: '{a}',
            },
            tooltip:{
                backgroundColor: "rgba(0,0,0,0.0)",
                position: "bottom",
                formatter: function(params){ return fmt_dec_max2.format(params.value);},
                padding: 0,
                transitionDuration: 0,
                textStyle:{
                    color: dataItem2[2],
                    fontSize: character_toolkit_size
                }
            },
            z: 2,
        });
    });

    // Min value
    option.series.push({
        silent: true,
        symbol: "pin",
        symbolSize: 20,
        coordinateSystem: 'singleAxis',
        type: 'scatter',
        data: [data_range[0][0]],
        name: data_range[0][1],
        color: data_range[0][2],
        label: {
            show: true,
            position:[-10,-30],
            rotate: 0, 
            fontSize: character_size,
            color: data_range[0][2],
            formatter: function(params){ 
                return params.seriesName + ":" + fmt_dec_max2.format(params.value);
            }
        },
        itemStyle:{
            color: "rgba(0,0,0,0)",
        },
        tooltip:{
            show: false
        },
        z:1,
    });
    // Max value
    option.series.push({
        silent: true,
        symbol: "pin",
        symbolSize: 20,
        coordinateSystem: 'singleAxis',
        type: 'scatter',
        data: [data_range[1][0]],
        name: data_range[1][1],
        color: data_range[1][2],
        label: {
            align: 'right',
            show: true,
            position:[3,-30],
            rotate: 0, 
            fontSize: character_size,
            color: data_range[1][2],
            formatter: function(params){ 
                return params.seriesName + ":" + fmt_dec_max2.format(params.value);
            }
        },
        itemStyle:{
            color: "rgba(0,0,0,0)",
        },
        tooltip:{
            show: false
        },
        z: 1,
    });

    var shift = (100-margins*2) * (minOutlier - minVal) / (maxVal - minVal);
    var L = (100-margins*2) * (maxOutlier - minOutlier) / (maxVal - minVal);

    // option.tooltip.push({
    //         position: 'bottom',
    // });

    option.singleAxis.push({
        left: margins + shift + '%',
        right: 100 - margins - shift- L+'%',
        type: 'value',
        boundaryGap: false,
        top: vertical_margins + '%',
        height: 0 + '%',
        min: minVal,
        max: maxVal,
        axisLabel: [{
            show: false
        }],
        axisTick: [{
            show: false
        }],
        axisLine: {
            lineStyle: {
                color: colorAxisShort,
                width: width_short_line
            }
        }
    });

    if (minOutlier != maxOutlier){

        var short_margin_right = bar_right + 1.5 * ((100-bar_right-bar_left) /(serie_label.length) );
        var short_margin_left = bar_left + 1.5 * ((100-bar_right-bar_left) /(serie_label.length) );
        
        option.singleAxis.push({
            left: short_margin_left + '%',
            right: short_margin_right + '%',
            type: 'value',
            boundaryGap: false,
            top: short_line_vertical_margins + '%',
            height: 0 + '%',
            min: minOutlier,
            max: maxOutlier,
            axisLabel: [{
                show: false
            }],
            axisTick: [{
                show: false
            }],
            axisLine: {
                lineStyle: {
                    color: colorAxisShort,
                    width: width_short_line
                }
            }
        });
        
        echarts.util.each( data_corto, function (dataItem2){
            option.series.push({
                //silent: true,
                singleAxisIndex: 2,
                symbolSize: size_circles_short,
                symbol: "triangle",
                symbolOffset: [0,size_circles_short-2],
                coordinateSystem: 'singleAxis',
                type: 'scatter',
                data: [dataItem2[0]],
                name: dataItem2[1],
                color: dataItem2[2],
                label: {
                    show: true,
                    position:[5, 5],
                    rotate: 45, 
                    fontSize: character_size,
                    fontWeight: 'bold',
                    color: dataItem2[2],
                    formatter: '{a}',
                },
                tooltip:{
                    backgroundColor: '#0a213ccc',
                    position: "top",
                    formatter: function(params){ return fmt_dec_max2.format(params.value);},
                    padding: 0,
                    transitionDuration: 0,
                    textStyle:{
                        color: dataItem2[2],
                        fontSize: character_toolkit_size
                    }
                }
            });
        });
        // Fix Median value
        option.series.push({
            silent: true,
            singleAxisIndex: 2,
            symbol: "none",
            coordinateSystem: 'singleAxis',
            type: 'scatter',
            data: [median],
            color: colorMedian,
            label: {
                show: false,
            },
            markPoint: {
                data: [{
                    value: median, 
                    coord: [median],
                    itemStyle:{
                        color: "rgba(0,0,0,0)"
                    },
                    label:{
                        color: colorMedian,
                        position: "top",
                        distance:2,
                        fontWeight:'bold',
                        formatter: function(params){ return fmt_dec_max2.format(params.value);}
                    },
                }],
            },
        });

    }


    // Bar Plot
    // -------------------------------------------------------------------

    option.grid.push({
        left: bar_left+'%',
        right: bar_right+'%',
        bottom: bar_plot_vertical_margin_bottom, 
        top: bar_plot_vertical_margin,
        containLabel: false
    });



    option.xAxis.push({
        gridIndex: 1,    
      axisPointer:{
        type:'shadow',z:0,
        shadowStyle:{color:'rgba(150,150,150,0.1)'},
      },    
      type: 'category',
      data: serie_label,
      axisLabel: {show:false,color:'#8999b9',fontSize: 10,},
      axisLine: {show:false,lineStyle: {color:'#455678'}},  
    });

    option.yAxis.push({
        gridIndex: 1,
      type: 'value',
      axisLine: {show:false,lineStyle: {color:color_background_1}},
      splitLine: {show: true,lineStyle: {color: '#455678'}},
      axisLabel: {
        margin:2,interval: 0,color:'#8999b9',fontSize: 10,
      },  
    });


    option.series.push({
        tooltip:{
            position: function (point, params, dom, rect, size) {
                return this.univariate.__tooltip_position(point, params, dom, rect, size);
            },
            formatter: function(params){
                    if (params.name == 'threshold') return;
                    let html = '';
                    html += "<div class='tooltip'>";
                    html += "<span class='u blue_labels'>interval:</span><br/>";
                    html += "<span class='f12'>&nbsp;"+params.name+"</span>";
                    html += "<div>";
                    html += "<table>";
                    html += "<tr>";
                    html += "<td class='i blue_labels'>Percentage:</td><td class='right value'>"+fmt_dec_max1.format(params.value*100)+"%"+'</td>';
                    html += "</tr>";
                    html += "<tr>";
                    html += "<td class='i blue_labels'>Records:</td><td class='right value'>"+fmt_int.format(params.value*informed)+"</td>";
                    html += "</tr>";
                    html += "</table>";
                    html += "</div>";
                    return html;
                },
            extraCssText: ec_tooltip,
        },
        animationDuration: 1000,
        name:'',
        z:1,
        type:'bar',
        data: serie_data,
        silent: false,
        barMaxWidth: 25,
        markLine: {
            silent: true,
            animation:true,
            label: {
                fontSize: 10,
                position:'start'
            },
            lineStyle: {
                color:'#e65068',
                type:'dashed'
            },
            xindexValue: 0,
            data: [
                [
                    {
                        //name: '< out',
                        symbol:'none',
                        xAxis: 1,
                        yAxis: 'min'
                    },
                    {   symbol: "none",
                        xAxis: 1,
                        y: short_line_vertical_margins + "%" }
                ],
                [
                    {
                        //name: '> out',
                        symbol:'none',
                        xAxis: serie_label.length-2,
                        yAxis: 'min'
                    },
                    {   symbol: "none",
                        xAxis: serie_label.length-2,
                        y: short_line_vertical_margins + "%"}
                ],
                [
                    {
                  label: {textBorderWidth:4,textBorderColor: color_background_1,fontSize: 12,fontWeight:'bold',position:'middle',lineHeight: 20,padding: [0,0,-7, 0],},
                      lineStyle: {opacity:0},
                        name: 'outliers < ' + fmt_dec_max2.format(minOutlier),symbol:'none',
                        xAxis: 1,
                        yAxis: 'min'
                    },
                    {xAxis: 1,y: short_line_vertical_margins + "%"}
                ],
                [
                    {
                      label: {textBorderWidth:4,textBorderColor: color_background_1,fontSize: 12,fontWeight:'bold',position:'middle',lineHeight: 20,padding: [0,0,-13, 0],},
                      lineStyle: {opacity:0},
                        name: 'outliers > ' + fmt_dec_max2.format(maxOutlier),symbol:'none',
                        xAxis: serie_label.length-2,
                        yAxis: 'min'
                    },
                    {
                        xAxis: serie_label.length-2,
                        y: short_line_vertical_margins + "%"}
                ],
                [
                    {
                        symbol:'none',
                        x: margins + shift + "%",
                        y: vertical_margins + "%",
                        lineStyle: {
                            color:colorAxisShort,
                            type:'dashed'}
                    },
                    {   
                        symbol: "none",
                        x: short_margin_left + "%",
                        y: short_line_vertical_margins + "%" }
                ],
                [
                    {
                        symbol:'none',
                        x: margins + shift + L + "%",
                        y: vertical_margins + "%",
                        lineStyle: {
                            color:colorAxisShort,
                            type:'dashed'}
                    },
                    {   
                        symbol: "none",
                        x: 100 - short_margin_right + "%",
                        y: short_line_vertical_margins + "%"}
                ]
            ]
        },
    });

    // Prepare series
    return option;
};
univariate.__numerical_graph_temporal_info = function(v_data){

    let months = v_data['dates'].length;
    let months_no_info = v_data['months w/o information'];

    let informed, missing, special;
    informed=v_data['informed records'];
    missing=v_data['missing records'];
    special=v_data['special records'];        

    let total = informed + missing + special;

    var series = [];
    var legend_labels = [];

    // Markareas months without info
    let non_informed= [];
     if (months_no_info > 0) {
        let non_informed_status= 'closed';
        let non_informed_initial= 0;
        let non_informed_i= 0;

        for (let month_value of v_data['temp_info']) {
            if (month_value == 0) {
                if (non_informed_status=='closed') {
                    non_informed_status= 'open';
                    non_informed_initial= non_informed_i;
                }
            }
            else if (non_informed_status=='open') {
                non_informed.push([
                    {
                        itemStyle:{color:'url(#texture-1) #102f54',origin:'start'},
                        xAxis: Math.max(non_informed_initial-1,0)
                    },
                    {xAxis: non_informed_i}
                ]);
                non_informed_status= 'closed';
            }
            non_informed_i+=1;
        }
        if (non_informed_status=='open') {
            non_informed.push([
                {
                    itemStyle:{color:'url(#texture-1) #102f54',origin:'start'},
                    xAxis: non_informed_initial-1
                },
                {xAxis: non_informed_i}
            ]);
            non_informed_status= 'closed';
        }
     }

    // Series
    // -------------------------------------------------------------------------
    series.push({
        type:'line',name:'informed',symbol:'none',
        data: v_data['temp_info'],lineStyle: {color: '#49a5e6'}
    });
    series.push({
        type:'line',name:'missing',symbol:'none',
        data: v_data['temp_missing'],lineStyle: {color: '#e65068'}
    });
    series.push({
        type:'line',name:'special',symbol:'none',
        data: v_data['temp_special'],lineStyle: {color: '#ea9234'}
    });
    // Markarea 100% non informed
    if (non_informed.length > 0) {
        series.push(
            {
                type:'line',name:'No information',data: null,
                markArea: {silent: true,data: non_informed,},
                itemStyle:{color:'url(#texture-1) #102f54'},
            }
        );
    }
     // Markarea 100% informed
    if (informed == total) {
        series.push(
            {
                type:'line',name:'#null#',data: null,
                markArea: {
                    silent: true,
                    data:[[{itemStyle: {color: '#49a5e616'},
                            name:'100% informed',xAxis: 0,show:true,
                            label:{color: '#49a5e6',position:'inside',}},
                            {xAxis: months-1}]]
                },
            }
        );
    }

    // Legend labels
    // -------------------------------------------------------------------------
    legend_labels.push({name:'informed'});
    legend_labels.push({name:'missing'});
    legend_labels.push({name:'special'});
    if (non_informed.length > 0) {
            legend_labels.push({name:'No information',icon:'rect',textStyle:{color:'#67799c'}});
    }

    // -------------------------------------------------------------------------
    // Echart object
    let options = {
        tooltip: {
            position: function (point, params, dom, rect, size) {
                return this.univariate.__tooltip_position(point, params, dom, rect, size);
            },
            trigger: 'axis',
            formatter: function(params){
                let html = '';
                html += "<div class='tooltip'>";
                html += "<span class='blue_labels'>Date:</span>";
                html += "<span class='f12'>&nbsp;"+params[0].name+"</span>";
                html += "<div>";
                html += "<table>";
                for (let item of params) {
                    html+="<tr>";
                    html+="<td class='blue_labels'>";
                    html+='<span class="element" style="color:'+item.color+'">&#x25b0;</span> ';
                    html+='<span class="i">'+item.seriesName+':</span></td>';
                    html+="<td class='right value'>";
                    html+=fmt_dec_max1.format(item.value*100)+"%"+'</td>';
                    html+="</tr>";
                }
                html += "</table>";
                html += "</div>";
                return html;
            },
            extraCssText: ec_tooltip,
        },
        legend: {
            inactiveColor:'#57698c',
            symbolKeepAspect:true,itemHeight:10,itemWidth:13,
            icon:'path://M20,25 100,25 80,75 0,75z', bottom:'0',
            textStyle: {
                padding:[0, 4, 0, -3],
                align:'left',
                color: '#8999b9',
                fontSize: 10,
            },
            data:legend_labels,
            itemGap:2,
        },
        grid: {left:  '65',right: '15',bottom:'40',top:   '10',},
        xAxis: {
            type: 'category',
            axisLabel: {color:'#8999b9',fontSize: 10},
            axisLine: {
                symbol: ['none', 'arrow'],
                symbolOffset:[0, 8],
                symbolSize:[6, 10],
                lineStyle: {color:'#8999b9'}
            },
            boundaryGap: false,
            data: v_data['dates']
        },
        yAxis: {
            splitLine: {show: true,lineStyle: {color: '#455678'}},
            type: 'value',
            axisLabel: {
                fontSize: 10,
                fontFamily: 'open sans',
                color:'#8999b9',
                formatter: function(x){ return fmt_dec_max1.format(x*100)+'%';}
            },
            axisLine: {lineStyle: {color:'#8999b9'}}
        },
        color:['#49a5e6','#e65068','#ea9234', '#e65068','#f6cb51'],
        animationDuration: 300,
        series: series
    };
    
    return options;
};
univariate.__numerical_graph_temporal_dist = function(v_data){

    let months = v_data['dates'].length;
    let months_no_info = v_data['months w/o information'];

    let series = [];
    let series_band = [];
    let legend_labels = [];

    // Markareas months without info
    let non_informed= [];
     if (months_no_info > 0) {
        let non_informed_status= 'closed';
        let non_informed_initial= 0;
        let non_informed_i= 0;

        for (let month_value of v_data['temp_info']) {
            if (month_value == 0) {
                if (non_informed_status=='closed') {
                    non_informed_status= 'open';
                    non_informed_initial= non_informed_i;
                }
            }
            else if (non_informed_status=='open') {
                non_informed.push([
                    {
                        itemStyle:{color:'url(#texture-1) #102f54',origin:'start'},
                        xAxis: Math.max(non_informed_initial-1,0)
                    },
                    {xAxis: non_informed_i}
                ]);
                non_informed_status= 'closed';
            }
            non_informed_i+=1;
        }
        if (non_informed_status=='open') {
            non_informed.push([
                {
                    itemStyle:{color:'url(#texture-1) #102f54',origin:'start'},
                    xAxis: non_informed_initial-1
                },
                {xAxis: non_informed_i}
            ]);
            non_informed_status= 'closed';
        }
     };

     // Series for band (stacked)
    for (let i = 0; i < v_data['temp_percentile75'].length; i++) {
        let diff=0;
        let p25=v_data['temp_percentile25'][i];
        let p75=v_data['temp_percentile75'][i];
        if (p25<0) diff=p75;
        else diff=p75-p25;
        series_band.push(diff);
    }

    legend_labels.push({name:'p75',textStyle: {color: '#3a80b2'}});
    legend_labels.push({name:'median',textStyle: {color: '#49a5e6'}});
    legend_labels.push({name:'p25',textStyle: {color: '#3a80b2'}});
    legend_labels.push({name:'mean',textStyle: {color: '#d8be75'}});
    if (non_informed.length > 0) {
            legend_labels.push({name:'No information',icon:'rect',textStyle:{color:'#67799c'}});
    }

    // Create chart;
    let options = {
        tooltip: {
            position: function (point, params, dom, rect, size) {
                return this.univariate.__tooltip_position(point, params, dom, rect, size);
            },
            trigger: 'axis',
            formatter: function(params){
                let html = '';
                html += "<div class='tooltip'>";
                html += "<span class='blue_labels'>Date:</span>";
                html += "<span class='f12'>&nbsp;"+params[0].name+"</span>";
                html += "<div>";
                html += "<table>";
                for (let item of params) {
                    // deactivate #band series
                    if (item.seriesName[0] == '#') continue;
                    let group_name = ""+item.seriesName+"";

                    html+="<tr>";
                    html+="<td class='blue_labels'>";
                    html+='<span class="element" style="color:'+item.color+'">&#x25b0;</span> ';
                    html+='<span class="i">'+group_name+':</span></td>';
                    html+="<td class='right value'>";
                    if (typeof item.value == "undefined") html+= '-';
                    else html+=format_number(item.value,'str');
                    html+="</td></tr>";
                }
                html += "</table>";
                html += "</div>";
                return html;
            },
            extraCssText: ec_tooltip,
        },
        legend: {
            inactiveColor:'#57698c',
            symbolKeepAspect:true,itemHeight:10,itemWidth:13,
            icon:'path://M20,25 100,25 80,75 0,75z', bottom:'0',itemGap:2,
            textStyle: {
                padding:[0, 4, 0, -3],
                align:'left',
                color: '#8999b9',
                fontSize: 10,
            },
            adata:[
                {name:'p75',textStyle: {color: '#3a80b2'}},
                {name:'median',textStyle: {color: '#49a5e6'}},
                {name:'p25',textStyle: {color: '#3a80b2'}},
                {name:'mean',textStyle: {color: '#d8be75'}},
            ],
            data:legend_labels,
        },
        grid: {left:  '65',right: '15',bottom:'57',top:   '10',},
        xAxis: {
            type: 'category',
            axisLabel: {color:'#8999b9',fontSize: 10},
            axisLine: {
                symbol: ['none', 'arrow'],
                symbolOffset:[0, 8],
                symbolSize:[6, 10],
                lineStyle: {color:'#8999b9'}
            },
            boundaryGap: false,
            data: v_data['dates']
        },
        yAxis: {
            type: 'value',
            scale:true,
            axisLabel: {margin:4,interval: 0,color:'#8999b9',fontSize: 10,},
            axisTick: {show:false},
            axisLine: {show:false},
            splitLine: {show: true,lineStyle: {color: '#556688'}},
        },
        color:['#175da4','#49a5e6','#175da4', '#d8be75','#00ccff'],
        animationDuration: 300,
        series: [
            {
                name:'p75',symbol:'none',
                lineStyle: {width:1,typed:'dotted'},
                type:'line',
                hoverAnimation:false,
                data: v_data['temp_percentile75'],
            },
            {
                name:'median',symbol:'none',
                type:'line',
                hoverAnimation:false,
                data: v_data['temp_median'],z:5,
            },
            {
                name:'p25',symbol:'none',
                lineStyle: {width:1,typed:'dotted'},
                type:'line',
                hoverAnimation:false,
                data: v_data['temp_percentile25'],
            },
            {
                name:'mean',symbol:'none',
                type:'line',
                hoverAnimation:false,
                data: v_data['temp_mean'],
            },
            {
                name:'#band2#',symbol:'none',
                lineStyle: {width:0},
                type:'line',
                hoverAnimation:false,
                data: v_data['temp_percentile25'],
                stack:'band',
            },
            {
                name:'#band1#',symbol:'none',
                lineStyle: {width:0},
                type:'line',
                hoverAnimation:false,
                data: series_band,
                stack:'band',
                areaStyle:{color:'#49a5e616',origin:'start'},
            },
            {
                type:'line',name:'No information',data: null,
                markArea: {silent: true,data: non_informed,},
                itemStyle:{color:'url(#texture-1) #102f54'},
            },
        ]
    };

    return options;
};

univariate.__numerical_information_box = function(v_data){

    let informed, missing, special;
    informed=v_data['informed records'];
    missing=v_data['missing records'];
    special=v_data['special records'];        
    
    let total = informed + missing + special;
    let informed_perc=(informed/total);
    let missing_perc=(missing/total);
    let special_perc=(special/total);

    let html = '';
    html += '<div><h1 class="block_subtitle">Information level</h1></div>';
    html += this.__information_level(missing,special,informed,missing_perc,special_perc,informed_perc);
    return {html: html, graphs: ''};
};
univariate.__numerical_distribution_box = function(v_data){

    // positive, zeros and negative data
    let informed=v_data['informed records'];
    let positive=v_data['positive'];
    let negative=v_data['negative'];
    let zeros=v_data['zeros'];
    let zeroes_perc=(zeros/informed);
    let asses_zeroes_perc = asses_univariate('missing_perc',[zeroes_perc]);

    // plots
    let chart = this.echarts_prepare_chart(this.__numerical_graph_histogram(v_data),{});

    let html = '';
    html += '<div><h1 class="block_subtitle">Distribution</h1></div>';

    // quantity of data by sign
    html += '<div class="block_table_2">';
    html += '<div style="width:90%">';
    html += '<table style="width:75%;margin:10px 0px 20px 0px;">';
    html += '<tr><td style="text-align:center;">Negative</td><td class="center">Zeros</td><td class="center">Positive</td></tr>';
    html += '<tr class="s_m"><td style="text-align:center;" class="center value">'+format_number(negative)+'</td>';
    html += '<td class="center value '+asses_zeroes_perc+'">'+format_number(zeros)+'</td>';
    html += '<td class="center value">'+format_number(positive)+'</td></tr>';
    html += '</table>';
    html += '</div>';
    html += '</div>';

    // graph
    html += chart.html;

    return {html: html, graphs: chart};
};
univariate.__numerical_temporal_information_box_v01 = function(v_data){
    // info
    let info_stability = v_data['information stability (evenly)'];
    let info_stability_w = v_data['information stability (weighted)'];
    let months = v_data['dates'].length;
    let months_no_info = v_data['months w/o information'];
    let informed_months = months - months_no_info;
    let assesment_months = asses_months_no_info(months,informed_months);
    let assesment_stability = asses_stability(info_stability,info_stability_w);

    // plots
    let chart = this.echarts_prepare_chart(this.__numerical_graph_temporal_info(v_data),{});

    // HTML
    let html = '';
    html += '<div><h1 class="block_subtitle">Temporal analysis</h1></div>';

    html += '<div class="block_table_2">';
    html += '<table style="width:88%;">';
    html += '<tr><td>Informed months: ';
    html += '<span class="value ' + assesment_months + '">' + fmt_num(informed_months);
    html += ' / ' + fmt_num(months) + '</span>';
    html += '</td>';
    html += '<td>Information stability:</td>';
    html += '<td>';
    html += '<span class="value ' + assesment_stability + '">' + fmt_num(info_stability,'4');
    html += '</span>';
    html += '<span class="value_small"> (global)</span></td>';
    html += '<td>';
    html += '<span class="value ' + assesment_stability + '">' + fmt_num(info_stability_w,'4');
    html += '</span>';
    html += '<span class="value_small"> (weighted)</span></td>';
    html += '</tr>';
    html += '</table>';
    html += '</div>';

    // Chart
    html += chart.html;

    return {html: html, graphs: chart};
};
univariate.__numerical_temporal_information_box_v02 = function(v_data){
    // info
    let info_stability = v_data['information divergence (uniform)'];
    let info_stability_w = v_data['information divergence (exponential)'];
    let months = v_data['dates'].length;
    let months_no_info = v_data['months w/o information'];
    let informed_months = months - months_no_info;
    let assesment_months = asses_months_no_info(months,informed_months);
    let assesment_stability = asses_stability(info_stability,info_stability_w);

    // plots
    let chart = this.echarts_prepare_chart(this.__numerical_graph_temporal_info(v_data),{});

    // HTML
    let html = '';
    html += '<div><h1 class="block_subtitle">Temporal analysis</h1></div>';

    html += '<div class="block_table_2">';
    html += '<table style="width:88%;">';
    html += '<tr><td>Informed months: ';
    html += '<span class="value ' + assesment_months + '">' + fmt_num(informed_months);
    html += ' / ' + fmt_num(months) + '</span>';
    html += '</td>';
    html += '<td>Divergence:</td>';
    html += '<td>';
    html += '<span class="value ' + assesment_stability + '">' + fmt_num(info_stability,'4');
    html += '</span>';
    html += '<span class="value_small"> (uniform)</span></td>';
    html += '<td>';
    html += '<span class="value ' + assesment_stability + '">' + fmt_num(info_stability_w,'4');
    html += '</span>';
    html += '<span class="value_small"> (exponential)</span></td>';
    html += '</tr>';
    html += '</table>';
    html += '</div>';

    // Chart
    html += chart.html;

    return {html: html, graphs: chart};
};
univariate.__numerical_temporal_distribution_box_v01 = function(v_data){
    // info
    let informed=v_data['informed records'];
    let data_stability=v_data['data values stability (evenly)'];
    let data_stability_w=v_data['data values stability (weighted)'];
    let assesment = asses_stability(data_stability,data_stability_w);

    // plots
    let chart = this.echarts_prepare_chart(this.__numerical_graph_temporal_dist(v_data),{});

    // HTML
    let html = '';

    html += '<div class="block_table_2">';
    html += '<table style="width:88%;">';
    html += '<tr><td>Informed records: ';
    html += '<span class="value">' + fmt_num(informed) + '</span>';
    html += '</td>';
    html += '<td>Values stability:</td>';
    html += '<td>';
    html += '<span class="value ' + assesment + '">' + fmt_num(data_stability,'4') + '</span>';
    html += '<span class="value_small"> (global)</span></td>';
    html += '<td>';
    html += '<span class="value ' + assesment + '">' + fmt_num(data_stability_w,'4') + '</span>';
    html += '<span class="value_small"> (weighted)</span></td>';
    html += '</tr>';
    html += '</table>';
    html += '</div>';

    // Chart
    html += chart.html;

    return {html: html, graphs: chart};
};
univariate.__numerical_temporal_distribution_box_v02 = function(v_data){
    // info
    let informed=v_data['informed records'];
    let data_stability=v_data['data values divergence (uniform)'];
    let data_stability_w=v_data['data values divergence (exponential)'];
    let assesment = asses_stability(data_stability,data_stability_w);

    // plots
    let chart = this.echarts_prepare_chart(this.__numerical_graph_temporal_dist(v_data),{});

    // HTML
    let html = '';

    html += '<div class="block_table_2">';
    html += '<table style="width:88%;">';
    html += '<tr><td>Informed records: ';
    html += '<span class="value">' + fmt_num(informed) + '</span>';
    html += '</td>';
    html += '<td>Divergence:</td>';
    html += '<td>';
    html += '<span class="value ' + assesment + '">' + fmt_num(data_stability,'4') + '</span>';
    html += '<span class="value_small"> (uniform)</span></td>';
    html += '<td>';
    html += '<span class="value ' + assesment + '">' + fmt_num(data_stability_w,'4') + '</span>';
    html += '<span class="value_small"> (exponential)</span></td>';
    html += '</tr>';
    html += '</table>';
    html += '</div>';

    // Chart
    html += chart.html;

    return {html: html, graphs: chart};
};

univariate.__information_level=function(missing,special,informed,missing_perc,special_perc,informed_perc) {
    let html = '';

    var missing_perc_2=fmt_dec_max2.format(missing_perc*100).split(".",2);
    var special_perc_2=fmt_dec_max2.format(special_perc*100).split(".",2);
    var informed_perc_2=fmt_dec_max2.format(informed_perc*100).split(".",2);
    if (typeof missing_perc_2[1] == 'undefined') missing_perc_2[1]='';
    else missing_perc_2[1]='.'+missing_perc_2[1];
    if (typeof special_perc_2[1] == 'undefined') special_perc_2[1]='';
    else special_perc_2[1]='.'+special_perc_2[1];
    if (typeof informed_perc_2[1] == 'undefined') informed_perc_2[1]='';
    else informed_perc_2[1]='.'+informed_perc_2[1];

    var asses_missing_perc = asses_univariate('missing_perc',[missing_perc]);
    var asses_special_perc = asses_univariate('missing_perc',[special_perc]);

    html+='<div class="big_number_3" style="margin:20px 0px">';

    html+='<div class="big_element" style="width:30%">';
    html+='<div>';
    html+='<svg preserveAspectRatio="none" style="vertical-align:middle;margin-right:2px;" viewBox="0 0 100 7" height="5px" width="10px"><path fill="'+color['coral']+'" d="M 0 0 L100 0 L85 7 L0 7 z"/></svg>';
    html+='<span class="label xt_missing" style="color:color_coral">'+'missing'+'</span>';
    html+='</div>';
    html+='<div class="main_value '+asses_missing_perc+'">'+missing_perc_2[0]+'';
    html+='<span class="main_value_small">'+missing_perc_2[1] +'%</span>';
    html+='</div>';
    html+='<div class="extra">'+fmt_int.format(missing)+'</div>';
    html+='</div>';

    html+='<div class="big_element" style="width:30%">';
    html+='<div>';
    html+='<svg preserveAspectRatio="none" style="vertical-align:middle;margin-right:2px;" viewBox="0 0 100 7" height="5px" width="10px"><path fill="'+color['orange']+'" d="M 0 0 L100 0 L85 7 L0 7 z"/></svg>';
    html+='<span class="label xt_special">'+'special'+'</span>';
    html+='</div>';
    html+='<div class="main_value '+asses_special_perc+'">'+special_perc_2[0]+'';
    html+='<span class="main_value_small">'+special_perc_2[1]+'%</span>';
    html+='</div>';
    html+='<div class="extra">'+fmt_int.format(special)+'</div>';
    html+='</div>';

    html+='<div class="big_element" style="width:30%">';
    html+='<div>';
    html+='<svg preserveAspectRatio="none" style="vertical-align:middle;margin-right:2px;" viewBox="0 0 100 7" height="5px" width="10px"><path fill="'+color['medium_blue_light']+'" d="M 0 0 L100 0 L85 7 L0 7 z"/></svg>';
    html+='<span class="label xt_informed">'+'informed'+'</span>';
    html+='</div>';
    html+='<div class="main_value">'+informed_perc_2[0]+'';
    html+='<span class="main_value_small">'+informed_perc_2[1]+'%</span>';
    html+='</div>';
    html+='<div class="extra">'+fmt_int.format(informed)+'</div>';
    html+='</div>';

    html+='</div>';
    return html;
}

// modal box
univariate.modal_boxes_prepare_contents =  function(json){
    console.log(json);

    // -------------------------------------------------------------------------
    // Initialize
    // -------------------------------------------------------------------------
    let results = {html:'', graphs: [], datatables: [], content_class:''};
    var v_data = json.data;
    v_data.version = json.layout_version;    
    // -------------------------------------------------------------------------
    // Prepare data
    // -------------------------------------------------------------------------
    if (v_data.version == '01')
    {
        switch(v_data["type"]){
            case "categorical":
            case "nominal":
                title_box = this.modal_boxes_html_title(v_data);
                information_box = this.__categorical_information_box(v_data);
                distribution_box = this.__categorical_distribution_box(v_data);
                temporal_information_box = this.__categorical_temporal_information_box_v01(v_data);
                temporal_distributio_box = this.__categorical_temporal_distribution_box_v01(v_data);
                break;
            case "numerical":
            case "ordinal":
                title_box = this.modal_boxes_html_title(v_data);
                information_box = this.__numerical_information_box(v_data);
                distribution_box = this.__numerical_distribution_box(v_data);
                temporal_information_box = this.__numerical_temporal_information_box_v01(v_data);
                temporal_distributio_box = this.__numerical_temporal_distribution_box_v01(v_data);
                break;
        }        
    }
    else if (v_data.version == '02')
    {
        switch(v_data["dtype"]){
            case "categorical":
            case "nominal":
                title_box = this.modal_boxes_html_title(v_data);
                information_box = this.__categorical_information_box(v_data);
                distribution_box = this.__categorical_distribution_box(v_data);
                temporal_information_box = this.__categorical_temporal_information_box_v02(v_data);
                temporal_distributio_box = this.__categorical_temporal_distribution_box_v02(v_data);
                break;
            case "numerical":
            case "ordinal":
                title_box = this.modal_boxes_html_title(v_data);
                information_box = this.__numerical_information_box(v_data);
                distribution_box = this.__numerical_distribution_box(v_data);
                temporal_information_box = this.__numerical_temporal_information_box_v02(v_data);
                temporal_distributio_box = this.__numerical_temporal_distribution_box_v02(v_data);
                break;
        }        
    }

    // -------------------------------------------------------------------------
    // Template
    // -------------------------------------------------------------------------
    let html = '';
    html += '<div class="first_column">'
    html += '<div style="grid-area: r1;">' + title_box + '</div>';
    html += '<div style="grid-area: r2;">' + information_box.html + '</div>';
    html += '<div class="row_3">' + distribution_box.html + '</div>';
    html += '</div>'
    html += '<div class="second_column">'
    html += '<div class="row_1">' + temporal_information_box.html + '</div>';
    html += '<div class="row_2">' + temporal_distributio_box.html + '</div>';
    html += '</div>'


    // -------------------------------------------------------------------------
    // Prepare results
    // -------------------------------------------------------------------------
    results.content_class = 'modal_univ_cat';
    results.graphs.push(information_box.graphs);
    results.graphs.push(distribution_box.graphs);
    results.graphs.push(temporal_information_box.graphs);
    results.graphs.push(temporal_distributio_box.graphs);
    results.html = html;
    // Filter boxes with no graphs
    results.graphs = results.graphs.filter(function(value){return value != ''});

    return results;
};

//------------------------------------------------------------------------
// GLOBAL SUMMARY UNIVARIATE
//------------------------------------------------------------------------
univariate.color_custom = { 
    axisLabelColor: '#8999b9',
    axisLineColor: '#8999b9',
    inactive_color: '#57698c',
    color_background_1: '#0a213c',
    color_sidebar_letter: '#999999',
    color_sidebar_value: '#dddddd',

    missings: '#e65068',
    specials: '#ea9234',
    informed: '#49a5e6',
};

univariate.__global_information_level_v01 = function(tables_data){
    
    var num_vars_num = tables_data.filter(function(value){ 
        return (value["type"] == "table_num_ord")?true:false;})[0];
    var num_vars_cat = tables_data.filter(function(value){ 
        return (value["type"] == "table_cat_nom")?true:false;})[0];

    tables_data =  [num_vars_num, num_vars_cat];

    // initialization
    var missings = [];
    var specials = [];
    var heat_map_m_s = [];
    var missings_specials = []

    // numericals j = 0, categoricals j = 1
    for (j = 0; j < 2; j++) {
        // indexes
        let miss_index = tables_data[j]["block_data"]["columns"].indexOf("%_missing");
        let spc_index = tables_data[j]["block_data"]["columns"].indexOf("%_special");

        for (i = 0; i < tables_data[j]["block_data"]["data"].length; i++) {
            missings.push(tables_data[j]["block_data"]["data"][i][miss_index]); // %_missings
            specials.push(tables_data[j]["block_data"]["data"][i][spc_index]); // %_specials
            heat_map_m_s.push([
                tables_data[j]["block_data"]["data"][i][miss_index],
                tables_data[j]["block_data"]["data"][i][spc_index]]); // heat map
            missings_specials.push(tables_data[j]["block_data"]["data"][i][miss_index] + 
                tables_data[j]["block_data"]["data"][i][spc_index]); // %_missings + %_specials
        };
    };

    // sort the elements in each array
    missings.sort(function(a,b){return b - a}); // descending sort
    specials.sort(function(a,b){return b - a}); // descending sort
    missings_specials.sort(function(a,b){return b - a}); // descending sort

    // sum of all elements. Needed to normalize
    var tot_missings = missings.reduce(add,0);
    var tot_specials = specials.reduce(add,0);
    var tot_missings_specials = missings_specials.reduce(add,0);
    function add(a, b){
        return a + b;
    }

    // initialization
    var data_missings = [];
    var data_specials = [];
    var data_missings_specials = [];

    var sum_missings = 0;
    var sum_specials = 0;
    var sum_missings_specials = 0;

    // Line Graph data
    for (i = 0; i < missings.length; i++){
        // cummulative sum.
        sum_missings += missings[i];
        sum_specials += specials[i];
        sum_missings_specials += missings_specials[i];
        // value of each (x,y) point of the graph.
        data_missings.push([(i+1)/missings.length , sum_missings/tot_missings]); // % of the total number of entries , % of total number of missings
        data_specials.push([(i+1)/specials.length , sum_specials/tot_specials]); // % of the total number of entries , % of total number of missings
        data_missings_specials.push([(i+1)/missings_specials.length , 
            sum_missings_specials/tot_missings_specials]); // % of the total number of entries , % of total number of missings
    }

    //initialization
    var category_missings = [0,0,0,0];
    var category_specials = [0,0,0,0];
    var category_informed = [0,0,0,0];
    //
    var num_category = [0,0,0,0];

    // Bar line data
    //% of missings, specials, per data type:
    for (j = 0; j < 2; j++) {
        // indexes
        let miss_index = tables_data[j]["block_data"]["columns"].indexOf("%_missing");
        let spc_index = tables_data[j]["block_data"]["columns"].indexOf("%_special");
        let type_index = tables_data[j]["block_data"]["columns"].indexOf("type");

        for (i = 0; i < tables_data[j]["block_data"]["data"].length; i++) {
            switch(tables_data[j]["block_data"]["data"][i][type_index]){
                case "numerical":
                    category_missings[0] += tables_data[j]["block_data"]["data"][i][miss_index];
                    category_specials[0] += tables_data[j]["block_data"]["data"][i][spc_index];
                    num_category[0] += 1;
                    break;
                case "ordinal":
                    category_missings[1] += tables_data[j]["block_data"]["data"][i][miss_index];
                    category_specials[1] += tables_data[j]["block_data"]["data"][i][spc_index];
                    num_category[1] += 1;
                    break;
                case "categorical":
                    category_missings[2] += tables_data[j]["block_data"]["data"][i][miss_index];
                    category_specials[2] += tables_data[j]["block_data"]["data"][i][spc_index];
                    num_category[2] += 1;
                    break;
                case "nominal":
                    category_missings[3] += tables_data[j]["block_data"]["data"][i][miss_index];
                    category_specials[3] += tables_data[j]["block_data"]["data"][i][spc_index];
                    num_category[3] += 1;
                    break;
            }
        };
    };
    // Normalize
    for (i = 0; i < category_missings.length; i++) {
        category_missings[i] = category_missings[i]/num_category[i];
        category_specials[i] = category_specials[i]/num_category[i];
        category_informed[i] = 1 - category_missings[i] - category_specials[i];
    };

    // For histogram plot
    var data_with_missings = missings.filter(with_errors);
    var data_with_specials = specials.filter(with_errors);
    var bins = 10;

    function with_errors(value){
        return value > 0;
    };
    function make_histogram(data, bins = 20){
        var max = 1;
        var min = 0;
        var increment = (max - min) / bins;
        var hist_data = [];
        for (i = 0; i < bins; i++) {
            elt_num = data.filter(function(value){
                return (value <= (max - i * increment) && value > (max - (i+1) * increment))
            }).length;
            hist_data[i] = [ Math.round((max - (i + 0.5) * increment) * 100)/100, elt_num/data.length ]
        }
        return hist_data;
    };

    var missings_hist = make_histogram(data_with_missings, bins);
    var specials_hist = make_histogram(data_with_specials, bins);

    // For heat histogram plot
    var data_with_error = heat_map_m_s.filter(with_errors_2D);
    function with_errors_2D(value){
        return value[0] > 0 || value[1] > 0;
    };

    function make_heat_histogram(data, bin_x = 10, bin_y = 5){
        var max = 1;
        var min = 0;
        var increment_x = (max - min) / bin_x;
        var increment_y = (max - min) / bin_y;
        var hist_heat_data = [];
        for (i = 0; i < bin_x; i++) {
            for (j = 0; j < bin_y; j++) {
                elt_num = data.filter(function(value){
                    return (
                        (value[0] < (max - i * increment_x) && value[0] >= (max - (i+1) * increment_x)) &&
                        (value[1] < (max - j * increment_y) && value[1] >= (max - (j+1) * increment_y)))
                }).length;
                //
                hist_heat_data[Math.round(i*bin_y+j)] = [ 
                    Math.round((max - (i + 0.5) * increment_x) * 100)/100,
                    Math.round((max - (j + 0.5) * increment_y) * 100)/100,
                    elt_num/data.length ];
            }
        }
        return hist_heat_data;
    };

    var heat_plot_m_s = make_heat_histogram(data_with_error);

    // Figure colors
    var color_01 = color.aqua;
    var color_02 = color.aqua_dark;
    var color_03 = color.medium_blue_light;
    var color_04 = color.core_blue_light;

    var colorheat = color.green_dark;

    // graph
    var option = {
        /*title:{
            subtext: "- Ordered variables in decreasing fashion by percentage of missings, specials and the "
                + "sum of both vs. their accumulated\n percentage.- Inner image: % of specials, missings and informed values for "
                + "each variable type.- Histogram: Percentage of\n variables within each level of missings or specials."
                + " The variables with no missings or specials are not considered here.",
            left: "3%",
            right: "3%",
            top: "88%",
            bottom: "3%",
        },*/
        color: [color_01, color_02, color_03, color_04],
        /*toolbox: {
            feature: {
                myTool2: {
                    show: true,
                    title: 'custom extension method',
                    icon: 'image://http://echarts.baidu.com/images/favicon.png',
                    onclick: function (){
                        alert('fdd')
                    }
                }
            }
        },*/
        tooltip: {
            trigger: 'axis',
            axisPointer:{
                type: 'none'
            },
            position: function (point, params, dom, rect, size) {
                return this.univariate.__tooltip_position(point, params, dom, rect, size);
            },
            formatter: function(params){
                let html = '';
                html += "<div class='tooltip'>";
                let add_group_name = "";
                let add_group_name_after = "";
                //check if there is any value of seriesIndex 0,1,2 (lines of first graph)
                if (params.filter(function(x){return x.seriesIndex >= 3 && x.seriesIndex < 6 }).length >= 1){
                    series_usadas = params.filter(function(x){return x.seriesIndex >= 3 && x.seriesIndex < 6 });
                    html += "<span class='u blue_labels'>" + series_usadas[0].name + "</span>";
                    html += "<p class='blue_labels'>Data quality for the "+series_usadas[0].name +" variable type</p>";
                    add_group_name = "% of "
                }
                else if (params.filter(function(x){return x.seriesIndex < 3}).length >= 1){
                    series_usadas = params.filter(function(x){return x.seriesIndex < 3});
                    html += "<p class='blue_labels'> Distribution of missings and/or specials in the variables. " 
                            + "The more tilted the more concentrated they are in a few variables. </p>";
                    html += "<p class='blue_labels'> The accumulated variables in the x-label are orderedy by missings and/or "
                            + "specials. </p>";
                    html += "<span class='blue_labels'>Accum. var.: " + fmt_dec_max1.format(series_usadas[0].value[0]*100) + "%" + " </span>";
                    add_group_name = "Accum. % of "
                }
                else if (params.filter(function(x){return x.seriesIndex >= 6 && x.seriesIndex < 8 }).length >= 1){
                    series_usadas = params.filter(function(x){return x.seriesIndex >= 6 && x.seriesIndex < 8 });
                    html += "<p class='blue_labels'> Percentage of variables within each range of missings or specials."
                            + " The variables with 0% are not considered here.</p>";

                    let interval = "[" + 
                        fmt_dec_max1.format((series_usadas[0].value[0] + 1 / (bins * 2)) * 100) + "%" + ", " + 
                        fmt_dec_max1.format((series_usadas[0].value[0] - 1 / (bins * 2)) * 100) + "%" + "]"

                    html += "<span class='blue_labels'>Range: " + interval + " </span>";

                    add_group_name = "% vars. for ";
                    add_group_name_after = ""
                    //html += "<span class='f12'>&nbsp;"+params.name+"</span>";
                }
                html += "<div>";
                html += "<table>";
                for (let item of series_usadas) {
                    let group_name = "'"+item.seriesName+"'";
                    html+="<tr style='vertical-align: top;'>";
                    html+='<td class="element" style="color:'+item.color+'">&#x25b0;</td> ';
                    html+="<td class='blue_labels'>";
                    html+='<span class="i">'+add_group_name+group_name+add_group_name_after+':</span></td>';
                    html+="<td class='right value'>";
                    if(item.data.length == 2) html+=fmt_dec_max1.format(item.value[1]*100)+"%";
                    else html+=fmt_dec_max1.format(item.value*100)+"%";
                    html+="</td></tr>";
                }
                html += "</table>";
                html += "</div>";
                return html;
            },
            extraCssText: ec_tooltip,
        },
        legend: {
            inactiveColor: this.color_custom.inactive_color,
            itemGap: 10,
            pageButtonItemGap: 0,
            data:[{
                name:'missings',
                icon: "rect"
            },{
                name: "specials",
                icon: 'rect'
            },{
                name: "m + s",
                icon: 'rect'
            },{
                name: "informed",
                icon: 'rect'
            }],
            textStyle:{color: this.color_custom.axisLabelColor},
        },
        grid: [{
            left: '3%',
            right: '54%',
            bottom: '8%',
            top: '13%',
            containLabel: true
        },{
            left: '25%',
            right: '54%',
            bottom: '20%',
            top: '30%',
            containLabel: true
        },{
            left: '55%',
            right: '4%',
            bottom: '8%',
            top: '13%',
            containLabel: true
        },{
            left: '50%',
            right: '4%',
            top: '56%',
            bottom: '8%',
            containLabel: true
        }],
        xAxis: [{
            type: 'value',
            splitLine: { 
                show: false
            },
            axisLabel: {
                color: this.color_custom.axisLabelColor, 
                formatter: function(x){ return fmt_pct_0_2.format(x);},
            },
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
            name: "accumulated variables",
            nameLocation: "middle",
            nameGap: 30,
            min:0,
            max:1,
        },{
            gridIndex: 1,
            type: 'category',
            data: ["numerical", "ordinal", "categorical", "nominal"],
            axisTick:{
                alignWithLabel: true,
                interval:0
            },
            axisLabel:{
                color: this.color_custom.axisLabelColor,
                rotate: 45,
            },
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
        },{
            gridIndex: 2,
            type: 'category',
            axisTick:{
                interval:0
            },
            axisLabel:{
                color: this.color_custom.axisLabelColor,
                formatter: function(x){ return fmt_pct_0_2.format(x);},
            },
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
            name: "% missings / specials",
            nameLocation: "middle",
            nameGap: 30,
        }
        ],
        yAxis: [{
            type: 'value',
            splitLine: { 
                show: false
            },
            axisLabel: {
                color: this.color_custom.axisLabelColor,
                formatter: function(x){ return fmt_pct_0_2.format(x);},
            },
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
            name: "accum. missings / specials",
            nameLocation: "middle",
            nameRotate: 90,
            nameGap: 35,
            min:0,
            max:1,
        },{

            gridIndex: 1,
            type: "value",
            splitLine: { 
                show: false
            },
            axisLine:{show:false},
            axisTick:{show:false},
            axisLabel:{show:false}
        },{
            gridIndex: 2,
            type: "value",
            splitLine: { 
                show: false
            },
            axisLabel: {
                color: this.color_custom.axisLabelColor,
                formatter: function(x){ return fmt_pct_0_2.format(x);},
            },
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
            name: "% variables",
            nameLocation: "middle",
            nameRotate: 90,
            nameGap: 35,
        }],
        series: [
            {
                name:'missings',
                type:'line',
                symbol: 'none',
                data: data_missings,
                lineStyle:{
                    color: color_01,
                    type: 'solid'
                },
            },{
                name:'specials',
                type:'line',
                symbol: 'none',
                data: data_specials,
                lineStyle:{
                    color: color_02,
                    type: 'solid'
                },
            },{
                name:'m + s',
                type:'line',
                symbol: 'none',
                data: data_missings_specials,
                lineStyle:{
                    color: color_03,
                    type: 'dashed'
                },
            },{
                name:'informed',
                xAxisIndex: 1,
                yAxisIndex: 1,
                data: category_informed,
                type: 'bar',
                stack: '100',
                barMaxWidth: '55%',
                color: color_04,
            },
            {
                name: "missings",
                xAxisIndex: 1,
                yAxisIndex: 1,
                data: category_missings,
                type: 'bar',
                stack: '100',
                barMaxWidth: '55%',
                color: color_01,
            },
            {
                name: "specials",
                xAxisIndex: 1,
                yAxisIndex: 1,
                data: category_specials,
                type: 'bar',
                stack: '100',
                barMaxWidth: '55%',
                color: color_02,
            },
            {
                name: "missings",
                xAxisIndex: 2,
                yAxisIndex: 2,
                data: missings_hist,
                type: 'bar',
                barMaxWidth: '75%',
                color: color_01,
            },
            {
                name: "specials",
                xAxisIndex: 2,
                yAxisIndex: 2,
                data: specials_hist,
                type: 'bar',
                barMaxWidth: '75%',
                color: color_02,
            },
        ]
    };
    // plots
    let chart = this.echarts_prepare_chart(option,{});
    return chart;
};

univariate.__global_information_level_v02 = function(tables_data){
    
    var num_vars_num = tables_data.filter(function(value){ 
        return (value["type"] == "table_num_ord")?true:false;})[0];
    var num_vars_cat = tables_data.filter(function(value){ 
        return (value["type"] == "table_cat_nom")?true:false;})[0];

    tables_data =  [num_vars_num, num_vars_cat];

    // initialization
    var missings = [];
    var specials = [];
    var heat_map_m_s = [];
    var missings_specials = []

    // numericals j = 0, categoricals j = 1
    for (j = 0; j < 2; j++) {
        // indexes
        let miss_index = tables_data[j]["block_data"]["columns"].indexOf("p_missing");
        let spc_index = tables_data[j]["block_data"]["columns"].indexOf("p_special");

        for (i = 0; i < tables_data[j]["block_data"]["data"].length; i++) {
            missings.push(tables_data[j]["block_data"]["data"][i][miss_index]); // %_missings
            specials.push(tables_data[j]["block_data"]["data"][i][spc_index]); // %_specials
            heat_map_m_s.push([
                tables_data[j]["block_data"]["data"][i][miss_index],
                tables_data[j]["block_data"]["data"][i][spc_index]]); // heat map
            missings_specials.push(tables_data[j]["block_data"]["data"][i][miss_index] + 
                tables_data[j]["block_data"]["data"][i][spc_index]); // %_missings + %_specials
        };
    };

    // sort the elements in each array
    missings.sort(function(a,b){return b - a}); // descending sort
    specials.sort(function(a,b){return b - a}); // descending sort
    missings_specials.sort(function(a,b){return b - a}); // descending sort

    // sum of all elements. Needed to normalize
    var tot_missings = missings.reduce(add,0);
    var tot_specials = specials.reduce(add,0);
    var tot_missings_specials = missings_specials.reduce(add,0);
    function add(a, b){
        return a + b;
    }

    // initialization
    var data_missings = [];
    var data_specials = [];
    var data_missings_specials = [];

    var sum_missings = 0;
    var sum_specials = 0;
    var sum_missings_specials = 0;

    // Line Graph data
    for (i = 0; i < missings.length; i++){
        // cummulative sum.
        sum_missings += missings[i];
        sum_specials += specials[i];
        sum_missings_specials += missings_specials[i];
        // value of each (x,y) point of the graph.
        data_missings.push([(i+1)/missings.length , sum_missings/tot_missings]); // % of the total number of entries , % of total number of missings
        data_specials.push([(i+1)/specials.length , sum_specials/tot_specials]); // % of the total number of entries , % of total number of missings
        data_missings_specials.push([(i+1)/missings_specials.length , 
            sum_missings_specials/tot_missings_specials]); // % of the total number of entries , % of total number of missings
    }

    //initialization
    var category_missings = [0,0,0,0];
    var category_specials = [0,0,0,0];
    var category_informed = [0,0,0,0];
    //
    var num_category = [0,0,0,0];

    // Bar line data
    //% of missings, specials, per data type:
    for (j = 0; j < 2; j++) {
        // indexes
        let miss_index = tables_data[j]["block_data"]["columns"].indexOf("p_missing");
        let spc_index = tables_data[j]["block_data"]["columns"].indexOf("p_special");
        let type_index = tables_data[j]["block_data"]["columns"].indexOf("dtype");

        for (i = 0; i < tables_data[j]["block_data"]["data"].length; i++) {
            switch(tables_data[j]["block_data"]["data"][i][type_index]){
                case "numerical":
                    category_missings[0] += tables_data[j]["block_data"]["data"][i][miss_index];
                    category_specials[0] += tables_data[j]["block_data"]["data"][i][spc_index];
                    num_category[0] += 1;
                    break;
                case "ordinal":
                    category_missings[1] += tables_data[j]["block_data"]["data"][i][miss_index];
                    category_specials[1] += tables_data[j]["block_data"]["data"][i][spc_index];
                    num_category[1] += 1;
                    break;
                case "categorical":
                    category_missings[2] += tables_data[j]["block_data"]["data"][i][miss_index];
                    category_specials[2] += tables_data[j]["block_data"]["data"][i][spc_index];
                    num_category[2] += 1;
                    break;
                case "nominal":
                    category_missings[3] += tables_data[j]["block_data"]["data"][i][miss_index];
                    category_specials[3] += tables_data[j]["block_data"]["data"][i][spc_index];
                    num_category[3] += 1;
                    break;
            }
        };
    };
    // Normalize
    for (i = 0; i < category_missings.length; i++) {
        category_missings[i] = category_missings[i]/num_category[i];
        category_specials[i] = category_specials[i]/num_category[i];
        category_informed[i] = 1 - category_missings[i] - category_specials[i];
    };

    // For histogram plot
    var data_with_missings = missings.filter(with_errors);
    var data_with_specials = specials.filter(with_errors);
    var bins = 10;

    function with_errors(value){
        return value > 0;
    };
    function make_histogram(data, bins = 20){
        var max = 1;
        var min = 0;
        var increment = (max - min) / bins;
        var hist_data = [];
        for (i = 0; i < bins; i++) {
            elt_num = data.filter(function(value){
                return (value <= (max - i * increment) && value > (max - (i+1) * increment))
            }).length;
            hist_data[i] = [ Math.round((max - (i + 0.5) * increment) * 100)/100, elt_num/data.length ]
        }
        return hist_data;
    };

    var missings_hist = make_histogram(data_with_missings, bins);
    var specials_hist = make_histogram(data_with_specials, bins);

    // For heat histogram plot
    var data_with_error = heat_map_m_s.filter(with_errors_2D);
    function with_errors_2D(value){
        return value[0] > 0 || value[1] > 0;
    };

    function make_heat_histogram(data, bin_x = 10, bin_y = 5){
        var max = 1;
        var min = 0;
        var increment_x = (max - min) / bin_x;
        var increment_y = (max - min) / bin_y;
        var hist_heat_data = [];
        for (i = 0; i < bin_x; i++) {
            for (j = 0; j < bin_y; j++) {
                elt_num = data.filter(function(value){
                    return (
                        (value[0] < (max - i * increment_x) && value[0] >= (max - (i+1) * increment_x)) &&
                        (value[1] < (max - j * increment_y) && value[1] >= (max - (j+1) * increment_y)))
                }).length;
                //
                hist_heat_data[Math.round(i*bin_y+j)] = [ 
                    Math.round((max - (i + 0.5) * increment_x) * 100)/100,
                    Math.round((max - (j + 0.5) * increment_y) * 100)/100,
                    elt_num/data.length ];
            }
        }
        return hist_heat_data;
    };

    var heat_plot_m_s = make_heat_histogram(data_with_error);

    // Figure colors
    var color_01 = color.aqua;
    var color_02 = color.aqua_dark;
    var color_03 = color.medium_blue_light;
    var color_04 = color.core_blue_light;

    var colorheat = color.green_dark;

    // graph
    var option = {
        /*title:{
            subtext: "- Ordered variables in decreasing fashion by percentage of missings, specials and the "
                + "sum of both vs. their accumulated\n percentage.- Inner image: % of specials, missings and informed values for "
                + "each variable type.- Histogram: Percentage of\n variables within each level of missings or specials."
                + " The variables with no missings or specials are not considered here.",
            left: "3%",
            right: "3%",
            top: "88%",
            bottom: "3%",
        },*/
        color: [color_01, color_02, color_03, color_04],
        /*toolbox: {
            feature: {
                myTool2: {
                    show: true,
                    title: 'custom extension method',
                    icon: 'image://http://echarts.baidu.com/images/favicon.png',
                    onclick: function (){
                        alert('fdd')
                    }
                }
            }
        },*/
        tooltip: {
            trigger: 'axis',
            axisPointer:{
                type: 'none'
            },
            position: function (point, params, dom, rect, size) {
                return this.univariate.__tooltip_position(point, params, dom, rect, size);
            },
            formatter: function(params){
                let html = '';
                html += "<div class='tooltip'>";
                let add_group_name = "";
                let add_group_name_after = "";
                //check if there is any value of seriesIndex 0,1,2 (lines of first graph)
                if (params.filter(function(x){return x.seriesIndex >= 3 && x.seriesIndex < 6 }).length >= 1){
                    series_usadas = params.filter(function(x){return x.seriesIndex >= 3 && x.seriesIndex < 6 });
                    html += "<span class='u blue_labels'>" + series_usadas[0].name + "</span>";
                    html += "<p class='blue_labels'>Data quality for the "+series_usadas[0].name +" variable type</p>";
                    add_group_name = "% of "
                }
                else if (params.filter(function(x){return x.seriesIndex < 3}).length >= 1){
                    series_usadas = params.filter(function(x){return x.seriesIndex < 3});
                    html += "<p class='blue_labels'> Distribution of missings and/or specials in the variables. " 
                            + "The more tilted the more concentrated they are in a few variables. </p>";
                    html += "<p class='blue_labels'> The accumulated variables in the x-label are orderedy by missings and/or "
                            + "specials. </p>";
                    html += "<span class='blue_labels'>Accum. var.: " + fmt_dec_max1.format(series_usadas[0].value[0]*100) + "%" + " </span>";
                    add_group_name = "Accum. % of "
                }
                else if (params.filter(function(x){return x.seriesIndex >= 6 && x.seriesIndex < 8 }).length >= 1){
                    series_usadas = params.filter(function(x){return x.seriesIndex >= 6 && x.seriesIndex < 8 });
                    html += "<p class='blue_labels'> Percentage of variables within each range of missings or specials."
                            + " The variables with 0% are not considered here.</p>";

                    let interval = "[" + 
                        fmt_dec_max1.format((series_usadas[0].value[0] + 1 / (bins * 2)) * 100) + "%" + ", " + 
                        fmt_dec_max1.format((series_usadas[0].value[0] - 1 / (bins * 2)) * 100) + "%" + "]"

                    html += "<span class='blue_labels'>Range: " + interval + " </span>";

                    add_group_name = "% vars. for ";
                    add_group_name_after = ""
                    //html += "<span class='f12'>&nbsp;"+params.name+"</span>";
                }
                html += "<div>";
                html += "<table>";
                for (let item of series_usadas) {
                    let group_name = "'"+item.seriesName+"'";
                    html+="<tr style='vertical-align: top;'>";
                    html+='<td class="element" style="color:'+item.color+'">&#x25b0;</td> ';
                    html+="<td class='blue_labels'>";
                    html+='<span class="i">'+add_group_name+group_name+add_group_name_after+':</span></td>';
                    html+="<td class='right value'>";
                    if(item.data.length == 2) html+=fmt_dec_max1.format(item.value[1]*100)+"%";
                    else html+=fmt_dec_max1.format(item.value*100)+"%";
                    html+="</td></tr>";
                }
                html += "</table>";
                html += "</div>";
                return html;
            },
            extraCssText: ec_tooltip,
        },
        legend: {
            inactiveColor: this.color_custom.inactive_color,
            itemGap: 10,
            symbolKeepAspect:true,itemHeight:11,itemWidth:13,            
            pageButtonItemGap: 0,
            data:[{
                name:'missings',
                icon: "rect"
            },{
                name: "specials",
                icon: 'rect'
            },{
                name: "m + s",
                icon: 'rect'
            },{
                name: "informed",
                icon: 'rect'
            }],
            textStyle:{color: this.color_custom.axisLabelColor},
        },
        grid: [{
            left: '3%',
            right: '54%',
            bottom: '8%',
            top: '13%',
            containLabel: true
        },{
            left: '25%',
            right: '54%',
            bottom: '20%',
            top: '30%',
            containLabel: true
        },{
            left: '55%',
            right: '4%',
            bottom: '8%',
            top: '13%',
            containLabel: true
        },{
            left: '50%',
            right: '4%',
            top: '56%',
            bottom: '8%',
            containLabel: true
        }],
        xAxis: [{
            type: 'value',
            splitLine: { 
                show: false
            },
            axisLabel: {
                color: this.color_custom.axisLabelColor, 
                formatter: function(x){ return fmt_pct_0_2.format(x);},
            },
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
            name: "accumulated variables",
            nameLocation: "middle",
            nameGap: 30,
            min:0,
            max:1,
        },{
            gridIndex: 1,
            type: 'category',
            data: ["numerical", "ordinal", "categorical", "nominal"],
            axisTick:{
                alignWithLabel: true,
                interval:0
            },
            axisLabel:{
                color: this.color_custom.axisLabelColor,
                rotate: 45,
            },
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
        },{
            gridIndex: 2,
            type: 'category',
            axisTick:{
                interval:0
            },
            axisLabel:{
                color: this.color_custom.axisLabelColor,
                formatter: function(x){ return fmt_pct_0_2.format(x);},
            },
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
            name: "% missings / specials",
            nameLocation: "middle",
            nameGap: 30,
        }
        ],
        yAxis: [{
            type: 'value',
            splitLine: { 
                show: false
            },
            axisLabel: {
                color: this.color_custom.axisLabelColor,
                formatter: function(x){ return fmt_pct_0_2.format(x);},
            },
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
            name: "accum. missings / specials",
            nameLocation: "middle",
            nameRotate: 90,
            nameGap: 35,
            min:0,
            max:1,
        },{

            gridIndex: 1,
            type: "value",
            splitLine: { 
                show: false
            },
            axisLine:{show:false},
            axisTick:{show:false},
            axisLabel:{show:false}
        },{
            gridIndex: 2,
            type: "value",
            splitLine: { 
                show: false
            },
            axisLabel: {
                color: this.color_custom.axisLabelColor,
                formatter: function(x){ return fmt_pct_0_2.format(x);},
            },
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
            name: "% variables",
            nameLocation: "middle",
            nameRotate: 90,
            nameGap: 35,
        }],
        series: [
            {
                name:'missings',
                type:'line',
                symbol: 'none',
                data: data_missings,
                lineStyle:{
                    color: color_01,
                    type: 'solid'
                },
            },{
                name:'specials',
                type:'line',
                symbol: 'none',
                data: data_specials,
                lineStyle:{
                    color: color_02,
                    type: 'solid'
                },
            },{
                name:'m + s',
                type:'line',
                symbol: 'none',
                data: data_missings_specials,
                lineStyle:{
                    color: color_03,
                    type: 'dashed'
                },
            },{
                name:'informed',
                xAxisIndex: 1,
                yAxisIndex: 1,
                data: category_informed,
                type: 'bar',
                stack: '100',
                barMaxWidth: '55%',
                color: color_04,
            },
            {
                name: "missings",
                xAxisIndex: 1,
                yAxisIndex: 1,
                data: category_missings,
                type: 'bar',
                stack: '100',
                barMaxWidth: '55%',
                color: color_01,
            },
            {
                name: "specials",
                xAxisIndex: 1,
                yAxisIndex: 1,
                data: category_specials,
                type: 'bar',
                stack: '100',
                barMaxWidth: '55%',
                color: color_02,
            },
            {
                name: "missings",
                xAxisIndex: 2,
                yAxisIndex: 2,
                data: missings_hist,
                type: 'bar',
                barMaxWidth: '75%',
                color: color_01,
            },
            {
                name: "specials",
                xAxisIndex: 2,
                yAxisIndex: 2,
                data: specials_hist,
                type: 'bar',
                barMaxWidth: '75%',
                color: color_02,
            },
        ]
    };
    // plots
    let chart = this.echarts_prepare_chart(option,{});
    return chart;
};


univariate.__global_stability_metric_v01 = function(tables_data){
    
    var stability_weighted = {"numerical":[], "ordinal":[], "categorical":[], "nominal":[]};
    var stability_global = {"numerical":[], "ordinal":[], "categorical":[], "nominal":[]};
    var stability_info_weighted = {"numerical":[], "ordinal":[], "categorical":[], "nominal":[]};
    var stability_info_global = {"numerical":[], "ordinal":[], "categorical":[], "nominal":[]};

    var num_vars_num = tables_data.filter(function(value){ 
        return (value["type"] == "table_num_ord")?true:false;})[0];
    var num_vars_cat = tables_data.filter(function(value){ 
        return (value["type"] == "table_cat_nom")?true:false;})[0];

    tables_data =  [num_vars_num, num_vars_cat];

    // stability per data type:
    for (j = 0; j < 2; j++) {
        // indexes
        let type_index = tables_data[j]["block_data"]["columns"].indexOf("type");
        let stab_W_index = tables_data[j]["block_data"]["columns"].indexOf("stability_1");
        let stab_G_index = tables_data[j]["block_data"]["columns"].indexOf("stability_2");
        let stab_info_W_index = tables_data[j]["block_data"]["columns"].indexOf("stability_info_1");
        let stab_info_G_index = tables_data[j]["block_data"]["columns"].indexOf("stability_info_2");

        for (i = 0; i < tables_data[j]["block_data"]["data"].length; i++) {
            var variable_type = tables_data[j]["block_data"]["data"][i][type_index];
            //
            stability_weighted[variable_type].push(tables_data[j]["block_data"]["data"][i][stab_W_index]);
            stability_global[variable_type].push(tables_data[j]["block_data"]["data"][i][stab_G_index]);
            stability_info_weighted[variable_type].push(tables_data[j]["block_data"]["data"][i][stab_info_W_index]);
            stability_info_global[variable_type].push(tables_data[j]["block_data"]["data"][i][stab_info_G_index]);
        };
    };

    //import { prepareBoxplotData } from 'echarts/extension/dataTool';

    // function for the format of the boxplot
    function formatter(param) {
        return [
            'Experiment ' + param.name + ': ',
            'upper: ' + param.data[0],
            'Q1: ' + param.data[1],
            'median: ' + param.data[2],
            'Q3: ' + param.data[3],
            'lower: ' + param.data[4]
        ].join('<br/>')
    }

    //
    var dist_stability_weighted = prepareBoxplotData([stability_weighted["numerical"],
        stability_weighted["ordinal"],stability_weighted["categorical"],
        stability_weighted["nominal"]]);
    var dist_stability_global = prepareBoxplotData([stability_global["numerical"],
        stability_global["ordinal"],stability_global["categorical"],
        stability_global["nominal"]]);
    var info_stability_weighted = prepareBoxplotData([stability_info_weighted["numerical"],
        stability_info_weighted["ordinal"],stability_info_weighted["categorical"],
        stability_info_weighted["nominal"]]);
    var info_stability_global = prepareBoxplotData([stability_info_global["numerical"],
        stability_info_global["ordinal"],stability_info_global["categorical"],
        stability_info_global["nominal"]]);

    //BP colors
    var color_all = color.aqua_dark;
    var color_in_box = color.sand;

    //Shapes
    let width_bars = ['45%','45%']

    // graph
    option = {
        color: [color_all, color_all, color_all, color_all],
        tooltip: {
            trigger: 'axis',
            axisPointer:{
                type: 'shadow',
                z: 0,
                shadowStyle:{
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [{
                            offset: 0.7, color: color.red_dark,  // color at 0% position
                        }, {
                            offset: 1, color: color.medium_blue, // color at 100% position
                        }],
                        global: false // false by default
                    },
                    opacity: 0.6,
                },
            },
            position: function (point, params, dom, rect, size) {
                return this.univariate.__tooltip_position(point, params, dom, rect, size);
            },
            formatter: function(params){
                let html = '';
                html += "<div class='tooltip'>";
                series_usadas = params.filter(function(x){return x.seriesType == "boxplot"});
                html += "<span class='u blue_labels'>" + params[0].name + " </span>";
                html += "<div>";
                html += "<table>";
                name_box_item = ["min", "Q1", "median", "Q3", "max"];
                if (series_usadas.length != 0){
                    for (let j = 1; j < series_usadas[0].value.length; j++) {
                        let group_name = "'"+name_box_item[name_box_item.length-j]+"'";
                        html+="<tr style='vertical-align: top;'>";
                        html+="<td class='blue_labels'>";
                        html+='<span class="i">'+group_name+':</span></td>';
                        html+="<td class='right value'>";
                        html+=fmt_dec_max3.format(series_usadas[0].value[series_usadas[0].value.length-j]);
                        html+="</td></tr>";
                    }
                }
                html+="<tr style='vertical-align: top;'>";
                html+="<td class='blue_labels'>";
                html+='<span class="i">num. outliers:</span></td>';
                html+="<td class='right value'>";
                html+=params.length-1;
                html+="</td></tr>";
                html += "</table>";
                html += "</div>";
                return html;
            },
            extraCssText: ec_tooltip,
        },
        dataZoom: [
            {
                type: 'inside',
                yAxisIndex: 0,
                startValue: 0,
                endValue: 1,
                filterMode: 'filter',
                minSpan: 0,
            },
            {
                type: 'slider',
                yAxisIndex: 0,
                filterMode: 'filter',
                backgroundcolor: "#2DCCCD",
                right: 0,
                textStyle:{color: this.color_custom.axisLabelColor}
            }
        ],
        legend: {
            inactiveColor: this.color_custom.inactive_color,
            data:[{
                name:'Dist. (W)',
                icon: "rect",
            },{
                name: 'Dist. (G)',
                icon: 'rect',
            },{
                name: 'Info. (W)',
                icon: 'rect',
            },{
                name: 'Info. (G)',
                icon: 'rect',
            }],
            selectedMode: "single",
            textStyle:{color: this.color_custom.axisLabelColor},
        },
        grid: [{
            left: '3%',
            right: '10%',
            bottom: '3%',
            containLabel: true,
        },{
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
        }],
        xAxis: [{
            type: 'category',
            data: ["num", "ord", "cat", "nom"],
            splitLine: { 
                show: false,
            },
            axisLabel: {
                color: this.color_custom.axisLabelColor
            },
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
        },],
        yAxis: [{
            type: 'value',
            possition: "left",
            splitLine: { 
                show: false,
            },
            axisLabel: {
                color: this.color_custom.axisLabelColor
            },
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
        }],
        series: [
            {
                yAxisIndex: 0,
                name:'Dist. (W)',
                type:'boxplot',
                data: dist_stability_weighted.boxData,
                itemStyle:{color: color_in_box},
                boxWidth: width_bars,
            },
            {
                yAxisIndex: 0,
                name:'Dist. (G)',
                type:'boxplot',
                data: dist_stability_global.boxData,
                itemStyle:{color: color_in_box},
                boxWidth: width_bars
            },
            {
                yAxisIndex: 0,
                name:'Info. (W)',
                type:'boxplot',
                data: info_stability_weighted.boxData,
                itemStyle:{color: color_in_box},
                boxWidth: width_bars,
            },
            {
                yAxisIndex: 0,
                name:'Info. (G)',
                type:'boxplot',
                data: info_stability_global.boxData,
                itemStyle:{color: color_in_box},
                boxWidth: width_bars,
            },
            {
                yAxisIndex: 0,
                name: 'Dist. (W)',
                type: 'scatter',
                data: dist_stability_weighted.outliers,
                symbolSize: 5,
                itemStyle:{
                    borderColor: color_in_box,
                    opacity: 0.5,
                },
            },
            {
                yAxisIndex: 0,
                name: 'Dist. (G)',
                type: 'scatter',
                data: dist_stability_global.outliers,
                symbolSize: 5,
                itemStyle:{
                    borderColor: color_in_box,
                    opacity: 0.5,
                },
            },
            {
                yAxisIndex: 0,
                name: 'Info. (W)',
                type: 'scatter',
                data: info_stability_weighted.outliers,
                symbolSize: 5,
                itemStyle:{
                    borderColor: color_in_box,
                    opacity: 0.5,
                },
            },
            {
                yAxisIndex: 0,
                name: 'Info. (G)',
                type: 'scatter',
                data: info_stability_global.outliers,
                symbolSize: 5,
                itemStyle:{
                    borderColor: color_in_box,
                    opacity: 0.5,
                },
            }
        ],
    };

    // plots
    let chart = this.echarts_prepare_chart(option,{});
    return chart;

    // functions from echarts/src/util/number
    function asc(arr) {
        arr.sort(function (a, b) {
            return a - b;
        });
        return arr;
    };
    function quantile(ascArr, p) {
        var H = (ascArr.length - 1) * p + 1;
        var h = Math.floor(H);
        var v = +ascArr[h - 1];
        var e = H - h;
        return e ? v + e * (ascArr[h] - v) : v;
    };
    // functions from echarts/extension/dataTool/prepareBoxplotData
    function prepareBoxplotData(rawData, opt) {
        opt = opt || [];
        var boxData = [];
        var outliers = [];
        var axisData = [];
        var boundIQR = opt.boundIQR;
        var useExtreme = boundIQR === 'none' || boundIQR === 0;

        for (var i = 0; i < rawData.length; i++) {
            axisData.push(i + '');
            var ascList = asc(rawData[i].slice());

            var Q1 = quantile(ascList, 0.25);
            var Q2 = quantile(ascList, 0.5);
            var Q3 = quantile(ascList, 0.75);
            var min = ascList[0];
            var max = ascList[ascList.length - 1];

            var bound = (boundIQR == null ? 1.5 : boundIQR) * (Q3 - Q1);

            var low = useExtreme
                ? min
                : Math.max(min, Q1 - bound);
            var high = useExtreme
                ? max
                : Math.min(max, Q3 + bound);

            boxData.push([low, Q1, Q2, Q3, high]);

            for (var j = 0; j < ascList.length; j++) {
                var dataItem = ascList[j];
                if (dataItem < low || dataItem > high) {
                    var outlier = [i, dataItem];
                    opt.layout === 'vertical' && outlier.reverse();
                    outliers.push(outlier);
                }
            }
        }
        return {
            boxData: boxData,
            outliers: outliers,
            axisData: axisData
        };
    }
};


univariate.__global_stability_metric_v02 = function(tables_data){
    
    var stability_weighted = {"numerical":[], "ordinal":[], "categorical":[], "nominal":[]};
    var stability_global = {"numerical":[], "ordinal":[], "categorical":[], "nominal":[]};
    var stability_info_weighted = {"numerical":[], "ordinal":[], "categorical":[], "nominal":[]};
    var stability_info_global = {"numerical":[], "ordinal":[], "categorical":[], "nominal":[]};

    var num_vars_num = tables_data.filter(function(value){ 
        return (value["type"] == "table_num_ord")?true:false;})[0];
    var num_vars_cat = tables_data.filter(function(value){ 
        return (value["type"] == "table_cat_nom")?true:false;})[0];

    tables_data =  [num_vars_num, num_vars_cat];

    // stability per data type:
    for (j = 0; j < 2; j++) {
        // indexes
        let type_index = tables_data[j]["block_data"]["columns"].indexOf("dtype");
        let stab_W_index = tables_data[j]["block_data"]["columns"].indexOf("t_data_div_exponential");
        let stab_G_index = tables_data[j]["block_data"]["columns"].indexOf("t_data_div_uniform");
        let stab_info_W_index = tables_data[j]["block_data"]["columns"].indexOf("t_info_div_exponential");
        let stab_info_G_index = tables_data[j]["block_data"]["columns"].indexOf("t_info_div_uniform");

        for (i = 0; i < tables_data[j]["block_data"]["data"].length; i++) {
            var variable_type = tables_data[j]["block_data"]["data"][i][type_index];
            //
            stability_weighted[variable_type].push(tables_data[j]["block_data"]["data"][i][stab_W_index]);
            stability_global[variable_type].push(tables_data[j]["block_data"]["data"][i][stab_G_index]);
            stability_info_weighted[variable_type].push(tables_data[j]["block_data"]["data"][i][stab_info_W_index]);
            stability_info_global[variable_type].push(tables_data[j]["block_data"]["data"][i][stab_info_G_index]);
        };
    };

    //import { prepareBoxplotData } from 'echarts/extension/dataTool';

    // function for the format of the boxplot
    function formatter(param) {
        return [
            'Experiment ' + param.name + ': ',
            'upper: ' + param.data[0],
            'Q1: ' + param.data[1],
            'median: ' + param.data[2],
            'Q3: ' + param.data[3],
            'lower: ' + param.data[4]
        ].join('<br/>')
    }

    //
    var dist_stability_weighted = prepareBoxplotData([stability_weighted["numerical"],
        stability_weighted["ordinal"],stability_weighted["categorical"],
        stability_weighted["nominal"]]);
    var dist_stability_global = prepareBoxplotData([stability_global["numerical"],
        stability_global["ordinal"],stability_global["categorical"],
        stability_global["nominal"]]);
    var info_stability_weighted = prepareBoxplotData([stability_info_weighted["numerical"],
        stability_info_weighted["ordinal"],stability_info_weighted["categorical"],
        stability_info_weighted["nominal"]]);
    var info_stability_global = prepareBoxplotData([stability_info_global["numerical"],
        stability_info_global["ordinal"],stability_info_global["categorical"],
        stability_info_global["nominal"]]);

    //BP colors
    var color_all = color.aqua_dark;
    var color_in_box = color.sand;

    //Shapes
    let width_bars = ['45%','45%']

    // graph
    option = {
        color: [color_all, color_all, color_all, color_all],
        tooltip: {
            trigger: 'axis',
            axisPointer:{
                type: 'shadow',
                z: 0,
                shadowStyle:{
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [{
                            offset: 0.7, color: color.red_dark,  // color at 0% position
                        }, {
                            offset: 1, color: color.medium_blue, // color at 100% position
                        }],
                        global: false // false by default
                    },
                    opacity: 0.6,
                },
            },
            position: function (point, params, dom, rect, size) {
                return this.univariate.__tooltip_position(point, params, dom, rect, size);
            },
            formatter: function(params){
                let html = '';
                html += "<div class='tooltip'>";
                series_usadas = params.filter(function(x){return x.seriesType == "boxplot"});
                html += "<span class='u blue_labels'>" + params[0].name + " </span>";
                html += "<div>";
                html += "<table>";
                name_box_item = ["min", "Q1", "median", "Q3", "max"];
                if (series_usadas.length != 0){
                    for (let j = 1; j < series_usadas[0].value.length; j++) {
                        let group_name = "'"+name_box_item[name_box_item.length-j]+"'";
                        html+="<tr style='vertical-align: top;'>";
                        html+="<td class='blue_labels'>";
                        html+='<span class="i">'+group_name+':</span></td>';
                        html+="<td class='right value'>";
                        html+=fmt_dec_max3.format(series_usadas[0].value[series_usadas[0].value.length-j]);
                        html+="</td></tr>";
                    }
                }
                html+="<tr style='vertical-align: top;'>";
                html+="<td class='blue_labels'>";
                html+='<span class="i">num. outliers:</span></td>';
                html+="<td class='right value'>";
                html+=params.length-1;
                html+="</td></tr>";
                html += "</table>";
                html += "</div>";
                return html;
            },
            extraCssText: ec_tooltip,
        },
        dataZoom: [
            {
                type: 'inside',
                yAxisIndex: 0,
                startValue: 0,
                endValue: 1,
                filterMode: 'filter',
                minSpan: 0,
            },
            {
                type: 'slider',
                yAxisIndex: 0,
                filterMode: 'filter',
                backgroundcolor: "#2DCCCD",
                right: 0,
                textStyle:{color: this.color_custom.axisLabelColor}
            }
        ],
        legend: {
            inactiveColor: this.color_custom.inactive_color,
            symbolKeepAspect:true,itemHeight:11,itemWidth:13,
            data:[{
                name:'Dist. (W)',
                icon: "rect",
            },{
                name: 'Dist. (G)',
                icon: 'rect',
            },{
                name: 'Info. (W)',
                icon: 'rect',
            },{
                name: 'Info. (G)',
                icon: 'rect',
            }],
            selectedMode: "single",
            textStyle:{color: this.color_custom.axisLabelColor},
        },
        grid: [{
            left: '3%',
            right: '10%',
            bottom: '3%',
            containLabel: true,
        },{
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
        }],
        xAxis: [{
            type: 'category',
            data: ["num", "ord", "cat", "nom"],
            splitLine: { 
                show: false,
            },
            axisLabel: {
                color: this.color_custom.axisLabelColor
            },
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
        },],
        yAxis: [{
            type: 'value',
            possition: "left",
            splitLine: { 
                show: false,
            },
            axisLabel: {
                color: this.color_custom.axisLabelColor
            },
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
        }],
        series: [
            {
                yAxisIndex: 0,
                name:'Dist. (W)',
                type:'boxplot',
                data: dist_stability_weighted.boxData,
                itemStyle:{color: color_in_box},
                boxWidth: width_bars,
            },
            {
                yAxisIndex: 0,
                name:'Dist. (G)',
                type:'boxplot',
                data: dist_stability_global.boxData,
                itemStyle:{color: color_in_box},
                boxWidth: width_bars
            },
            {
                yAxisIndex: 0,
                name:'Info. (W)',
                type:'boxplot',
                data: info_stability_weighted.boxData,
                itemStyle:{color: color_in_box},
                boxWidth: width_bars,
            },
            {
                yAxisIndex: 0,
                name:'Info. (G)',
                type:'boxplot',
                data: info_stability_global.boxData,
                itemStyle:{color: color_in_box},
                boxWidth: width_bars,
            },
            {
                yAxisIndex: 0,
                name: 'Dist. (W)',
                type: 'scatter',
                data: dist_stability_weighted.outliers,
                symbolSize: 5,
                itemStyle:{
                    borderColor: color_in_box,
                    opacity: 0.5,
                },
            },
            {
                yAxisIndex: 0,
                name: 'Dist. (G)',
                type: 'scatter',
                data: dist_stability_global.outliers,
                symbolSize: 5,
                itemStyle:{
                    borderColor: color_in_box,
                    opacity: 0.5,
                },
            },
            {
                yAxisIndex: 0,
                name: 'Info. (W)',
                type: 'scatter',
                data: info_stability_weighted.outliers,
                symbolSize: 5,
                itemStyle:{
                    borderColor: color_in_box,
                    opacity: 0.5,
                },
            },
            {
                yAxisIndex: 0,
                name: 'Info. (G)',
                type: 'scatter',
                data: info_stability_global.outliers,
                symbolSize: 5,
                itemStyle:{
                    borderColor: color_in_box,
                    opacity: 0.5,
                },
            }
        ],
    };

    // plots
    let chart = this.echarts_prepare_chart(option,{});
    return chart;

    // functions from echarts/src/util/number
    function asc(arr) {
        arr.sort(function (a, b) {
            return a - b;
        });
        return arr;
    };
    function quantile(ascArr, p) {
        var H = (ascArr.length - 1) * p + 1;
        var h = Math.floor(H);
        var v = +ascArr[h - 1];
        var e = H - h;
        return e ? v + e * (ascArr[h] - v) : v;
    };
    // functions from echarts/extension/dataTool/prepareBoxplotData
    function prepareBoxplotData(rawData, opt) {
        opt = opt || [];
        var boxData = [];
        var outliers = [];
        var axisData = [];
        var boundIQR = opt.boundIQR;
        var useExtreme = boundIQR === 'none' || boundIQR === 0;

        for (var i = 0; i < rawData.length; i++) {
            axisData.push(i + '');
            var ascList = asc(rawData[i].slice());

            var Q1 = quantile(ascList, 0.25);
            var Q2 = quantile(ascList, 0.5);
            var Q3 = quantile(ascList, 0.75);
            var min = ascList[0];
            var max = ascList[ascList.length - 1];

            var bound = (boundIQR == null ? 1.5 : boundIQR) * (Q3 - Q1);

            var low = useExtreme
                ? min
                : Math.max(min, Q1 - bound);
            var high = useExtreme
                ? max
                : Math.min(max, Q3 + bound);

            boxData.push([low, Q1, Q2, Q3, high]);

            for (var j = 0; j < ascList.length; j++) {
                var dataItem = ascList[j];
                if (dataItem < low || dataItem > high) {
                    var outlier = [i, dataItem];
                    opt.layout === 'vertical' && outlier.reverse();
                    outliers.push(outlier);
                }
            }
        }
        return {
            boxData: boxData,
            outliers: outliers,
            axisData: axisData
        };
    }
};


univariate.__global_concentration_metric_v01 = function(tables_data){
    
    var concentration = {"numerical":[], "ordinal":[], "categorical":[], "nominal":[]};

    var num_vars_num = tables_data.filter(function(value){ 
        return (value["type"] == "table_num_ord")?true:false;})[0];
    var num_vars_cat = tables_data.filter(function(value){ 
        return (value["type"] == "table_cat_nom")?true:false;})[0];

    tables_data =  [num_vars_num, num_vars_cat];

    // idexes
    let Concentration_index = tables_data[0]["block_data"]["columns"].indexOf("concentration");
    let HHI_index = tables_data[1]["block_data"]["columns"].indexOf("concentration_HHI");


    // stability per data type:
    for (j = 0; j < 2; j++) {
        let type_index = tables_data[j]["block_data"]["columns"].indexOf("type");
        for (i = 0; i < tables_data[j]["block_data"]["data"].length; i++) {
            var variable_type = tables_data[j]["block_data"]["data"][i][type_index];
            //
            switch(variable_type){
                case "numerical":
                case "ordinal":
                    concentration[variable_type].push(tables_data[j]["block_data"]["data"][i][Concentration_index]);
                    break;
                case "categorical":
                case "nominal":
                    concentration[variable_type].push(tables_data[j]["block_data"]["data"][i][HHI_index]);
                    break;
            }
        };
    };

    // function for the format of the boxplot
    function formatter(param) {
        return [
            'Experiment ' + param.name + ': ',
            'upper: ' + param.data[0],
            'Q1: ' + param.data[1],
            'median: ' + param.data[2],
            'Q3: ' + param.data[3],
            'lower: ' + param.data[4]
        ].join('<br/>')
    }

    //
    var big_bin = prepareBoxplotData([concentration["numerical"],
        concentration["ordinal"]]);
    var HHI_data = prepareBoxplotData([concentration["categorical"],
        concentration["nominal"]]);

    //BP colors
    var color_all = color.aqua_dark;
    var color_in_box = color.red_light;
    var color_in_box_2 = color.purple;

    //Shapes
    let width_bars = ['40%','40%']

    // graph
    option = {
        color: [color_all, color_all, color_all, color_all],
        tooltip: {
            trigger: 'axis',
            axisPointer:{
                type: 'shadow',
                z: 0,
                shadowStyle:{
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [{
                            offset: 0, color: color.red_dark,  // color at 0% position
                        }, {
                            offset: 1, color: color.medium_blue, // color at 100% position
                        }],
                        global: false // false by default
                    },
                    opacity: 0.6,
                },
            },
            position: function (point, params, dom, rect, size) {
                return this.univariate.__tooltip_position(point, params, dom, rect, size);
            },
            formatter: function(params){
                let html = '';
                html += "<div class='tooltip'>";
                series_usadas = params.filter(function(x){return x.seriesType == "boxplot"});
                html += "<span class='u blue_labels'>" + series_usadas[0].name + " </span>";
                html += "<div>";
                html += "<table>";
                name_box_item = ["min", "Q1", "median", "Q3", "max"];
                if (series_usadas != 0){
                    for (let j = 1; j < series_usadas[0].value.length; j++) {
                        let group_name = "'"+name_box_item[name_box_item.length-j]+"'";
                        html+="<tr style='vertical-align: top;'>";
                        html+="<td class='blue_labels'>";
                        html+='<span class="i">'+group_name+':</span></td>';
                        html+="<td class='right value'>";
                        html+=fmt_dec_max3.format(series_usadas[0].value[series_usadas[0].value.length-j]);
                        html+="</td></tr>";
                    };
                }
                html+="<tr style='vertical-align: top;'>";
                html+="<td class='blue_labels'>";
                html+='<span class="i">num. outliers:</span></td>';
                html+="<td class='right value'>";
                html+=params.length-1;
                html+="</td></tr>";
                html += "</table>";
                html += "</div>";
                return html;
            },
            extraCssText: ec_tooltip,
        },
        grid: [{
            left: '3%',
            right: '50%',
            bottom: '3%',
            top: '3%',
            containLabel: true,
        },{
            left: '50%',
            right: '4%',
            bottom: '3%',
            top: '3%',
            containLabel: true,
        }],
        xAxis: [{
            gridIndex: 0,
            type: 'category',
            data: ["num", "ord"],
            splitLine: { 
                show: false,
            },
            axisLabel: {color: this.color_custom.axisLabelColor},
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
        },{
            gridIndex: 1,
            type: 'category',
            data: ["cat", "nom"],
            splitLine: { 
                show: false,
            },
            axisLabel: {color: this.color_custom.axisLabelColor},
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
        },],
        yAxis: [{
            gridIndex: 0,
            type: 'value',
            possition: "left",
            splitLine: { 
                show: false,
            },
            axisLabel: {color: this.color_custom.axisLabelColor},
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
        },
        {
            gridIndex: 1,
            type: 'value',
            possition: "left",
            splitLine: { 
                show: false,
            },
            axisLabel: {color: this.color_custom.axisLabelColor},
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
        }],
        series: [
            {
                yAxisIndex: 0,
                xAxisIndex: 0,
                type:'boxplot',
                data: big_bin.boxData,
                itemStyle:{color: color_in_box},
                boxWidth: width_bars,
            },
            {
                yAxisIndex: 1,
                xAxisIndex: 1,
                type:'boxplot',
                data: HHI_data.boxData,
                itemStyle:{color: color_in_box_2},
                boxWidth: width_bars,
            },
            {
                yAxisIndex: 0,
                xAxisIndex: 0,
                type: 'scatter',
                data: big_bin.outliers,
                symbolSize: 5,
                itemStyle:{
                    borderColor: color_in_box,
                    opacity: 0.5,
                },
            },
            {
                yAxisIndex: 1,
                xAxisIndex: 1,
                type: 'scatter',
                data: HHI_data.outliers,
                symbolSize: 5,
                itemStyle:{
                    borderColor: color_in_box_2,
                    opacity: 0.5,
                },
            }
        ],
    };

    // plots
    let chart = this.echarts_prepare_chart(option,{});
    return chart;

    // functions from echarts/src/util/number
    function asc(arr) {
        arr.sort(function (a, b) {
            return a - b;
        });
        return arr;
    };
    function quantile(ascArr, p) {
        var H = (ascArr.length - 1) * p + 1;
        var h = Math.floor(H);
        var v = +ascArr[h - 1];
        var e = H - h;
        return e ? v + e * (ascArr[h] - v) : v;
    };
    // functions from echarts/extension/dataTool/prepareBoxplotData
    function prepareBoxplotData(rawData, opt) {
        opt = opt || [];
        var boxData = [];
        var outliers = [];
        var axisData = [];
        var boundIQR = opt.boundIQR;
        var useExtreme = boundIQR === 'none' || boundIQR === 0;

        for (var i = 0; i < rawData.length; i++) {
            axisData.push(i + '');
            var ascList = asc(rawData[i].slice());

            var Q1 = quantile(ascList, 0.25);
            var Q2 = quantile(ascList, 0.5);
            var Q3 = quantile(ascList, 0.75);
            var min = ascList[0];
            var max = ascList[ascList.length - 1];

            var bound = (boundIQR == null ? 1.5 : boundIQR) * (Q3 - Q1);

            var low = useExtreme
                ? min
                : Math.max(min, Q1 - bound);
            var high = useExtreme
                ? max
                : Math.min(max, Q3 + bound);

            boxData.push([low, Q1, Q2, Q3, high]);

            for (var j = 0; j < ascList.length; j++) {
                var dataItem = ascList[j];
                if (dataItem < low || dataItem > high) {
                    var outlier = [i, dataItem];
                    opt.layout === 'vertical' && outlier.reverse();
                    outliers.push(outlier);
                }
            }
        }
        return {
            boxData: boxData,
            outliers: outliers,
            axisData: axisData
        };
    }
};
univariate.__global_concentration_metric_v02 = function(tables_data){
    
    var concentration = {"numerical":[], "ordinal":[], "categorical":[], "nominal":[]};

    var num_vars_num = tables_data.filter(function(value){ 
        return (value["type"] == "table_num_ord")?true:false;})[0];
    var num_vars_cat = tables_data.filter(function(value){ 
        return (value["type"] == "table_cat_nom")?true:false;})[0];

    tables_data =  [num_vars_num, num_vars_cat];

    // idexes
    let Concentration_index = tables_data[0]["block_data"]["columns"].indexOf("d_concentration");
    let HHI_index = tables_data[1]["block_data"]["columns"].indexOf("d_hhi");


    // stability per data type:
    for (j = 0; j < 2; j++) {
        let type_index = tables_data[j]["block_data"]["columns"].indexOf("dtype");
        for (i = 0; i < tables_data[j]["block_data"]["data"].length; i++) {
            var variable_type = tables_data[j]["block_data"]["data"][i][type_index];
            //
            switch(variable_type){
                case "numerical":
                case "ordinal":
                    concentration[variable_type].push(tables_data[j]["block_data"]["data"][i][Concentration_index]);
                    break;
                case "categorical":
                case "nominal":
                    concentration[variable_type].push(tables_data[j]["block_data"]["data"][i][HHI_index]);
                    break;
            }
        };
    };

    // function for the format of the boxplot
    function formatter(param) {
        return [
            'Experiment ' + param.name + ': ',
            'upper: ' + param.data[0],
            'Q1: ' + param.data[1],
            'median: ' + param.data[2],
            'Q3: ' + param.data[3],
            'lower: ' + param.data[4]
        ].join('<br/>')
    }

    //
    var big_bin = prepareBoxplotData([concentration["numerical"],
        concentration["ordinal"]]);
    var HHI_data = prepareBoxplotData([concentration["categorical"],
        concentration["nominal"]]);

    //BP colors
    var color_all = color.aqua_light;
    var color_in_box = color.aqua_dark;
    var color_in_box_2 = color.aqua_dark;

    //Shapes
    let width_bars = ['25%','25%']

    // graph
    option = {
        color: [color_all, color_all, color_all, color_all],
        tooltip: {
            trigger: 'axis',
            axisPointer:{
                type: 'shadow',
                z: 0,
                shadowStyle:{
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [{
                            offset: 0, color: color.red_dark,  // color at 0% position
                        }, {
                            offset: 1, color: color.medium_blue, // color at 100% position
                        }],
                        global: false // false by default
                    },
                    opacity: 0.6,
                },
            },
            position: function (point, params, dom, rect, size) {
                return this.univariate.__tooltip_position(point, params, dom, rect, size);
            },
            formatter: function(params){
                let html = '';
                html += "<div class='tooltip'>";
                series_usadas = params.filter(function(x){return x.seriesType == "boxplot"});
                html += "<span class='u blue_labels'>" + series_usadas[0].name + " </span>";
                html += "<div>";
                html += "<table>";
                name_box_item = ["min", "Q1", "median", "Q3", "max"];
                if (series_usadas != 0){
                    for (let j = 1; j < series_usadas[0].value.length; j++) {
                        let group_name = "'"+name_box_item[name_box_item.length-j]+"'";
                        html+="<tr style='vertical-align: top;'>";
                        html+="<td class='blue_labels'>";
                        html+='<span class="i">'+group_name+':</span></td>';
                        html+="<td class='right value'>";
                        html+=fmt_dec_max3.format(series_usadas[0].value[series_usadas[0].value.length-j]);
                        html+="</td></tr>";
                    };
                }
                html+="<tr style='vertical-align: top;'>";
                html+="<td class='blue_labels'>";
                html+='<span class="i">num. outliers:</span></td>';
                html+="<td class='right value'>";
                html+=params.length-1;
                html+="</td></tr>";
                html += "</table>";
                html += "</div>";
                return html;
            },
            extraCssText: ec_tooltip,
        },
        grid: [{
            left: '3%',
            right: '50%',
            bottom: '3%',
            top: '3%',
            containLabel: true,
        },{
            left: '50%',
            right: '4%',
            bottom: '3%',
            top: '3%',
            containLabel: true,
        }],
        xAxis: [{
            gridIndex: 0,
            type: 'category',
            data: ["num", "ord"],
            splitLine: { 
                show: false,
            },
            axisLabel: {color: this.color_custom.axisLabelColor,fontSize: 11,},
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
        },{
            gridIndex: 1,
            type: 'category',
            data: ["cat", "nom"],
            splitLine: { 
                show: false,
            },
            axisLabel: {color: this.color_custom.axisLabelColor,fontSize: 11,},
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
        },],
        yAxis: [{
            gridIndex: 0,
            type: 'value',
            possition: "left",
            splitLine: { 
                show: false,
            },
            axisLabel: {color: this.color_custom.axisLabelColor,fontSize: 11,},
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
        },
        {
            gridIndex: 1,
            type: 'value',
            possition: "left",
            splitLine: { 
                show: false,
            },
            axisLabel: {color: this.color_custom.axisLabelColor,fontSize: 11,},
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
        }],
        series: [
            {
                yAxisIndex: 0,
                xAxisIndex: 0,
                type:'boxplot',
                data: big_bin.boxData,
                itemStyle:{color: color_in_box},
                boxWidth: width_bars,
            },
            {
                yAxisIndex: 1,
                xAxisIndex: 1,
                type:'boxplot',
                data: HHI_data.boxData,
                itemStyle:{color: color_in_box_2},
                boxWidth: width_bars,
            },
            {
                yAxisIndex: 0,
                xAxisIndex: 0,
                type: 'scatter',
                data: big_bin.outliers,
                symbolSize: 5,
                itemStyle:{
                    borderColor: color_in_box,
                    opacity: 0.5,
                },
            },
            {
                yAxisIndex: 1,
                xAxisIndex: 1,
                type: 'scatter',
                data: HHI_data.outliers,
                symbolSize: 5,
                itemStyle:{
                    borderColor: color_in_box_2,
                    opacity: 0.5,
                },
            }
        ],
    };

    // plots
    let chart = this.echarts_prepare_chart(option,{});
    return chart;

    // functions from echarts/src/util/number
    function asc(arr) {
        arr.sort(function (a, b) {
            return a - b;
        });
        return arr;
    };
    function quantile(ascArr, p) {
        var H = (ascArr.length - 1) * p + 1;
        var h = Math.floor(H);
        var v = +ascArr[h - 1];
        var e = H - h;
        return e ? v + e * (ascArr[h] - v) : v;
    };
    // functions from echarts/extension/dataTool/prepareBoxplotData
    function prepareBoxplotData(rawData, opt) {
        opt = opt || [];
        var boxData = [];
        var outliers = [];
        var axisData = [];
        var boundIQR = opt.boundIQR;
        var useExtreme = boundIQR === 'none' || boundIQR === 0;

        for (var i = 0; i < rawData.length; i++) {
            axisData.push(i + '');
            var ascList = asc(rawData[i].slice());

            var Q1 = quantile(ascList, 0.25);
            var Q2 = quantile(ascList, 0.5);
            var Q3 = quantile(ascList, 0.75);
            var min = ascList[0];
            var max = ascList[ascList.length - 1];

            var bound = (boundIQR == null ? 1.5 : boundIQR) * (Q3 - Q1);

            var low = useExtreme
                ? min
                : Math.max(min, Q1 - bound);
            var high = useExtreme
                ? max
                : Math.min(max, Q3 + bound);

            boxData.push([low, Q1, Q2, Q3, high]);

            for (var j = 0; j < ascList.length; j++) {
                var dataItem = ascList[j];
                if (dataItem < low || dataItem > high) {
                    var outlier = [i, dataItem];
                    opt.layout === 'vertical' && outlier.reverse();
                    outliers.push(outlier);
                }
            }
        }
        return {
            boxData: boxData,
            outliers: outliers,
            axisData: axisData
        };
    }
};
univariate.__global_apply_summary_v01 = function(tables_data){
    
    var vars_values = tables_data["data"];
    var column_names = tables_data["columns"];

    // initialize objetcs
    var data = {};
    let info_to_show = ["keep", "remove"];
    for (let i = 0; i < info_to_show.length; i++){
        data[info_to_show[i]] = {nominal: {"num": 0, "cases":{}}, 
            categorical: {"num": 0, "cases":{}}, ordinal: {"num": 0, "cases":{}}, 
            numerical: {"num": 0, "cases":{}}, total: {"num": 0, "cases":{}}};
    };

    // filter keep and tranformed elements
    vars_values.forEach(function(value){
        apply_action = value[column_names.indexOf("action")]
        data[apply_action].total["num"] += 1;
        data[apply_action][value[column_names.indexOf("type")]]["num"] += 1;
    });

    // reasons for transformation or elimination:
    for (orden of Object.keys(data)){
        for (tipo of Object.keys(data[orden])){
            // filter only the variables transformed
            vars_values.filter(function(value){
                if (tipo == "total"){
                    return (value[column_names.indexOf("action")] == orden)? true:false;
                }
                else{
                    return (value[column_names.indexOf("action")] == orden && 
                        value[column_names.indexOf("type")] == tipo)? true:false;
                }
            }).map(function(value){
                return value[column_names.indexOf("case")]
            }).filter(function(value, index, self){
                return self.indexOf(value) === index;
            }).map(function(value){
                data[orden][tipo]["cases"][value] = 0;
            });
        }
    };

    vars_values.forEach(function(value){
        let orden = value[column_names.indexOf("action")];
        let tipo = value[column_names.indexOf("type")];
        let caso = value[column_names.indexOf("case")];
        data[orden][tipo]["cases"][caso] += 1;
        data[orden]["total"]["cases"][caso] += 1;
    });

    //BP colors
    var color_all = color.red_dark;

    var color_text_legend = color.red;

     // graph
    option = {
        color: [color.medium_blue, color.red_dark],
        tooltip: {
            trigger: 'axis',
            axisPointer:{
                type: 'shadow'
            },
            position: function (point, params, dom, rect, size) {
                return this.univariate.__tooltip_position(point, params, dom, rect, size, "right");
            },
            transitionDuration: 0,
            formatter: function(params){
                let html = '';
                html += "<div class='tooltip'>";
                html += "<span class='u blue_labels'>" + params[0].name + "</span>";
                html += "<div>";
                html += "<table>";
                for(item of params){
                    html += "<tr style='vertical-align: top;'>";
                    html += '<td class="element" style="color:' + item.color + '">&#x25b0;</td> ';
                    html += "<td class='blue_labels'>";
                    html += '<span class="i">' + "'" + item.seriesName + "'" + ':</span></td>';
                    html += "<td class='right value'>";
                    html += item.value;
                    html += "</td></tr>";
                    let keys_sorted = Object.keys(data[item.seriesName][item.name]["cases"]).sort(
                        function(a,b){
                            return data[item.seriesName][item.name]["cases"][b]-data[item.seriesName][item.name]["cases"][a]
                        })
                    for (caso of keys_sorted){
                        if(caso == ""){
                            continue;
                        }
                        else{
                            html += "<tr style='vertical-align: top;'>";
                            html += "<td/><td class='blue_labels'>";
                            html += '<span class="i">' + "-    '" + caso + "'" + ':</span></td>';
                            html += "<td class='right value'>";
                            html += data[item.seriesName][item.name]["cases"][caso];
                            html += "</td></tr>";
                        }
                    }
                    html += "<tr><td/></tr><tr><td/></tr><tr><td/></tr><tr><td/></tr><tr><td/></tr>";
                }

                html += "</table>";
                html += "</div>";
                html += "</div>";
                return html;
            },
            extraCssText: ec_tooltip,
        },
        legend: {
            show: false,
        },
        grid: [{
            left: '3%',
            right: '4%',
            top: '3%',
            bottom: '0%',
            containLabel: true
        }],
        xAxis: [{
            show: false,
            type: 'value',
            splitLine: { 
                show: false
            },
            axisLine:{show: false},
            axisTick:{show:false},
            axisLabel:{show:false},
            //max: 1,
        }],
        yAxis: [{
            type: 'category',
            data: ["nominal", "categorical", "ordinal", "numerical", "total"],
            position: "right",
            axisLabel:{ 
                inside: true, 
                color: this.color_custom.color_sidebar_value,
                fontWeight: "bold",
                fontSize: 11,
            },
            axisTick:{ show:false },
            axisLine: {show: false},
            z: 3,
        }],
        series: [],
    };

    echarts.util.each( info_to_show, function (value){
        option.series.push({
            type: 'bar',
            data: Object.values(data[value]).map(function(value){ return value["num"] }),
            name: value,
            barWidth: "55%",
            stack: '100',
        });
    });

    // plots
    let chart = this.echarts_prepare_chart(option,{});
    return chart;
};

univariate.__global_actions = function(tables_data){
    // todo get position
    let actions = {};
    for (let i = 0; i < tables_data.length; i++){
        let summary_table=tables_data[i].block_data;
        for (let j = 0; j < summary_table.data.length; j++){
            actions[summary_table.data[j][2]]=(actions[summary_table.data[j][2]] || 0)+1;
        }
    }
    let action_labels= Object.keys(actions).sort();
    let action_counts= [];
    for (let j = 0; j < action_labels.length; j++){
        action_counts.push(actions[action_labels[j]]);
    }

    html = "";
    let block_options = 
            {
                params:{},
                data:{
                    labels:action_labels,
                    values:action_counts
                }
            };
    html+=this.block_render_table_actions(block_options);
    return html;    
}
univariate.__global_apply_summary_v02 = function(tables_data){
    
    var vars_values = tables_data["data"];
    var column_names = tables_data["columns"];

    // initialize objetcs
    var data = {};
    // todo: actions names should not be hardcoded;
    let info_to_show = ["keep", "remove", "review"];
    for (let i = 0; i < info_to_show.length; i++){
        data[info_to_show[i]] = {nominal: {"num": 0, "cases":{}}, 
            categorical: {"num": 0, "cases":{}}, ordinal: {"num": 0, "cases":{}}, 
            numerical: {"num": 0, "cases":{}}, total: {"num": 0, "cases":{}}};
    };

    // filter keep and tranformed elements
    vars_values.forEach(function(value){
        apply_action = value[column_names.indexOf("action")]
        data[apply_action].total["num"] += 1;
        data[apply_action][value[column_names.indexOf("dtype")]]["num"] += 1;
    });

    // reasons for transformation or elimination:
    for (orden of Object.keys(data)){
        for (tipo of Object.keys(data[orden])){
            // filter only the variables transformed
            vars_values.filter(function(value){
                if (tipo == "total"){
                    return (value[column_names.indexOf("action")] == orden)? true:false;
                }
                else{
                    return (value[column_names.indexOf("action")] == orden && 
                        value[column_names.indexOf("dtype")] == tipo)? true:false;
                }
            }).map(function(value){
                return value[column_names.indexOf("status")]
            }).filter(function(value, index, self){
                return self.indexOf(value) === index;
            }).map(function(value){
                data[orden][tipo]["cases"][value] = 0;
            });
        }
    };

    vars_values.forEach(function(value){
        let orden = value[column_names.indexOf("action")];
        let tipo = value[column_names.indexOf("dtype")];
        let caso = value[column_names.indexOf("status")];
        data[orden][tipo]["cases"][caso] += 1;
        data[orden]["total"]["cases"][caso] += 1;
    });

    //BP colors
    var color_all = color.red_dark;

    var color_text_legend = color.red;

     // graph
    option = {
        color: [color.medium_blue, color.red_dark],
        tooltip: {
            trigger: 'axis',
            axisPointer:{
                type: 'shadow'
            },
            position: function (point, params, dom, rect, size) {
                return this.univariate.__tooltip_position(point, params, dom, rect, size, "right");
            },
            transitionDuration: 0,
            formatter: function(params){
                let html = '';
                html += "<div class='tooltip'>";
                html += "<span class='u blue_labels'>" + params[0].name + "</span>";
                html += "<div>";
                html += "<table>";
                for(item of params){
                    html += "<tr style='vertical-align: top;'>";
                    html += '<td class="element" style="color:' + item.color + '">&#x25b0;</td> ';
                    html += "<td class='blue_labels'>";
                    html += '<span class="i">' + "'" + item.seriesName + "'" + ':</span></td>';
                    html += "<td class='right value'>";
                    html += item.value;
                    html += "</td></tr>";
                    let keys_sorted = Object.keys(data[item.seriesName][item.name]["cases"]).sort(
                        function(a,b){
                            return data[item.seriesName][item.name]["cases"][b]-data[item.seriesName][item.name]["cases"][a]
                        })
                    for (caso of keys_sorted){
                        if(caso == ""){
                            continue;
                        }
                        else{
                            html += "<tr style='vertical-align: top;'>";
                            html += "<td/><td class='blue_labels'>";
                            html += '<span class="i">' + "-    '" + caso + "'" + ':</span></td>';
                            html += "<td class='right value'>";
                            html += data[item.seriesName][item.name]["cases"][caso];
                            html += "</td></tr>";
                        }
                    }
                    html += "<tr><td/></tr><tr><td/></tr><tr><td/></tr><tr><td/></tr><tr><td/></tr>";
                }

                html += "</table>";
                html += "</div>";
                html += "</div>";
                return html;
            },
            extraCssText: ec_tooltip,
        },
        legend: {
            show: false,
        },
        grid: [{
            left: '3%',
            right: '4%',
            top: '3%',
            bottom: '0%',
            containLabel: true
        }],
        xAxis: [{
            show: false,
            type: 'value',
            splitLine: { 
                show: false
            },
            axisLine:{show: false},
            axisTick:{show:false},
            axisLabel:{show:false},
            //max: 1,
        }],
        yAxis: [{
            type: 'category',
            data: ["nominal", "categorical", "ordinal", "numerical", "total"],
            position: "right",
            axisLabel:{ 
                inside: true, 
                color: this.color_custom.color_sidebar_value,
                fontWeight: "bold",
                fontSize: 11,
            },
            axisTick:{ show:false },
            axisLine: {show: false},
            z: 3,
        }],
        series: [],
    };

    echarts.util.each( info_to_show, function (value){
        option.series.push({
            type: 'bar',
            data: Object.values(data[value]).map(function(value){ return value["num"] }),
            name: value,
            barWidth: "55%",
            stack: '100',
        });
    });

    // plots
    let chart = this.echarts_prepare_chart(option,{});
    return chart;
};
univariate.__global_cpu_time = function(tables_data){
    
    var operation_type = ["total"];
    
    var var_types = tables_data["index"].filter(function(value){return (value == "total")? false: true;});
    var time_spend_by_var_type = tables_data["data"].filter(function(value, idx){
        return (tables_data["index"][idx] == "total")? false: true;});

    option = {
        tooltip: {
            trigger: 'item',
            position: function (point, params, dom, rect, size) {
                return this.univariate.__tooltip_position(point, params, dom, rect, size);
            },
            formatter: function(params){
                let html = '';
                html += "<div class='tooltip'>";
                html += "<span class='u blue_labels'>Time consumed</span>";
                html += "<div>";
                html += "<table>";
                html += "<tr style='vertical-align: top;'>";
                html += '<td class="element" style="color:' + params.color + '">&#x25b0;</td> ';
                html += "<td class='blue_labels'>";
                html += '<span class="i">' + "'" + params.name + "'" + ':</span></td>';
                html += "<td class='right value'>";
                html += fmt_dec_max2.format(params.value) + "s";
                html += "</td></tr>";
                html += "</table>";
                html += "</div>";
                html += "</div>";
                return html;
            },
            extraCssText: ec_tooltip,
        },
        grid: [{
            left: '10%',
            right: '10%',
            bottom: '3%',
            top: '3%',
            containLabel: true,
        }],
        xAxis: {
            type: 'category',
            data: ["num", "ord", "cat", "nom"],
            axisLine: {
                show: false,
                lineStyle: {color: this.color_custom.axisLineColor},
            },
            axisLabel: {color: this.color_custom.axisLabelColor},
            axisTick:{
                show: false,
                alignWithLabel: true,
            },
            splitLine: {
                show: false,
            },
        },
        yAxis: {
            type: 'value',
            data: operation_type,
            axisLine: {
                show: false,
                lineStyle: {color: this.color_custom.axisLineColor}
            },
            axisTick:{
                show: false,
                alignWithLabel: true,
            },
            axisLabel: {show: false, color: this.color_custom.axisLabelColor},
            splitLine: {
                show: false
            },
        },
        series: [{
            type: 'bar',
            data: time_spend_by_var_type,
            barWidth: "55%",
            itemStyle:{
                color: color.core_blue,
            }

        }]
    };

    // plots
    let chart = this.echarts_prepare_chart(option,{});
    return chart;
};

univariate.__global_left_sidebar_01 = function (tables_data, flag_title = true, big_elements = 999, table_elements = 999) {
    let html = "";
    let block_options = 
            {
                title: flag_title == true ? get_block_description(tables_data.type) : null,
                params: {
                    big_elements:big_elements,
                    small_elements:table_elements,
                    table_css_class: 'no_border'
                },
                data:{
                    labels:tables_data.block_data.index,
                    values:tables_data.block_data.data
                }
            };
    html+=this.block_render_big_numbers(block_options);
    return html;
};
univariate.__global_left_sidebar_02 = function (tables_data, flag_title = true, num_elements = 999, table_elements = 999) {
    let html = "";
    let block_options = 
            {
                title: flag_title == true ? get_block_description(tables_data.type) : null,
                params: {
                    num_elements:num_elements,
                },
                data:{
                    labels:tables_data.block_data.index,
                    values:tables_data.block_data.data
                }
            };
    html+=this.block_render_table(block_options);
    return html;
};

univariate.__global_left_sidebar_output_data_v01 = function (samples_info,variables_info) {
    let samples_output=samples_info.data[samples_info.index.indexOf('records')];
    let variables_output=variables_info.data[variables_info.index.indexOf('after univariate')];    
    let html = "";
    let block_options = 
            {
                params: {
                    big_elements:2,
                },
                data:{
                    labels:['records','variables'],
                    values:[samples_output,variables_output]
                }
            };
    html+=this.block_render_big_numbers(block_options);
    return html;    
}

univariate.__global_left_sidebar_output_data_v02 = function (samples_info,variables_info) {
    let samples_output=samples_info.data[samples_info.index.indexOf('samples')];
    let variables_output=variables_info.data[variables_info.index.indexOf('after univariate')];    
    let html = "";
    let block_options = 
            {
                params: {
                    big_elements:2,
                },
                data:{
                    labels:['samples','variables'],
                    values:[samples_output,variables_output]
                }
            };
    html+=this.block_render_big_numbers(block_options);
    return html;    
}

univariate.__global_action_table = function (tables_data) {

    var vars_values = tables_data["block_data"]["data"];
    var column_names = tables_data["block_data"]["index"];
    let title = tables_data["type"]

    var html = "";

    html += '<div class="block_table">';
    html += '<table>';
    for(let i = 0; i < vars_values.length; i++){
        switch(column_names[i]){
            case "original data":
                break;            
            case "after univariate":
                //html += '<tr><td class = "icon_check color_ok">&nbsp;<span class="grey">' + "kept" + '</td><td class="color_ok" style="font-weight: bold;">' + vars_values[i] + '</td></tr>';
                break;
            case "removed":
                html += '<tr><td class = "icon_cross color_rm">&nbsp;<span class="grey">' + column_names[i] + '</td><td class="color_rm" style="font-weight: bold;">' + vars_values[i] + '</td></tr>';
                break;
            case "transformed":
                html += '<tr><td class = "icon_tool color_tr">&nbsp;<span class="grey">' + column_names[i] + '</td><td class="color_tr" style="font-weight: bold;">' + vars_values[i] + '</td></tr>';
                break;
            default:
                html += '<tr><td style="text-align:left">' + column_names[i] + '</td><td class="value">' + vars_values[i] + '</td></tr>';
                break;
        };
    };
    html += '</table>';
    html += '</div>';

    return html;
};


univariate.__gs_sidebar_1_datatypes = function (tables_data) {
    var html = '';

    // todo: loop, and put __gs_sidebar_1_datatypes in main.js
    let counts = this.__table_count_by_column(tables_data[0]['block_data']["data"],tables_data[0]['block_data']["columns"],'dtype',sort=true);
    counts = this.__table_count_by_column(tables_data[1]['block_data']["data"],tables_data[1]['block_data']["columns"],'dtype',sort=true,prev_results=counts);

    block_options = 
            {
                data:{
                    labels: counts.labels,
                    values:counts.counts,
                }
            };
    html+=this.block_render_table(block_options);  
    return html;
};

univariate.__gs_sidebar_1_findings = function (tables_data) {
    var html = '';
    var findings = {};

    // create a object
    for(let k = 0; k < tables_data.index.length; k++){
        findings[tables_data.index[k]] = tables_data.data[k];
    }
    // remove properties
    delete findings['numerical'];
    delete findings['ordinal'];
    delete findings['categorical'];
    delete findings['nominal'];

    block_options = 
            {
                data:{
                    labels: Object.keys(findings),
                    values: Object.values(findings),
                }
            };
    html+=this.block_render_table(block_options);  
    return html;
};

univariate.__gs_sidebar_1_actions = function(tables_data){
    var html = '';
    let counts = this.__table_count_by_column(tables_data[0]['block_data']["data"],tables_data[0]['block_data']["columns"],'recommended_action',sort=true);
    counts = this.__table_count_by_column(tables_data[1]['block_data']["data"],tables_data[1]['block_data']["columns"],'recommended_action',sort=true,prev_results=counts);

    block_options = 
            {
                data:{
                    labels: counts.labels,
                    values:counts.counts,
                }
            };
    html+=this.block_render_table_actions(block_options);
    return html;    
}


univariate.__global_boxes_prepare_contents = function(json){
    // -------------------------------------------------------------------------
    // Custom functions
    // -------------------------------------------------------------------------
    function step_contents_data(obj, value_step_id, value_content_type){
        return obj["item_steps"].filter(function(value){
            return (value["step_id"] == value_step_id)? true: false;
        })[0]["step_contents"].filter(function(value){
            return (value["type"] == value_content_type)? true: false;
        })[0]
    }

    function step_contents_block_data(obj, value_step_id, value_content_type, value_block_type){
        return obj["item_steps"].filter(function(value){
            return (value["step_id"] == value_step_id)? true: false;
        })[0]["step_contents"].filter(function(value){
            return (value["type"] == value_content_type)? true: false;
        })[0]["content_blocks"].filter(function(value){
            return (value["type"] == value_block_type)? true: false;
        })[0]
    }

    // -------------------------------------------------------------------------
    // Initialize
    // -------------------------------------------------------------------------
    let results = {html:'', graphs: [], datatables: []};

    // Check if apply/transformation exists.
    let exists_apply = json["item_steps"].some(function(value){
        return ( value["step_type"] == "transform" || value["step_type"] == "apply" );});
    let version = json.item_layout_version;

    let information_level, stability_metric, concentration_metric, cpu_time, 
        total_value_cpu_0, total_value_cpu_1, left_sidebar_01, left_sidebar_02, left_sidebar_03,left_sidebar_04;

    let sidebar_1_datatypes, sidebar_1_findings,sidebar_1_actions;
    let apply_summary_transform;
    let sidebar_2_actions;    
    // -------------------------------------------------------------------------
    // Prepare data
    // -------------------------------------------------------------------------
    left_sidebar_01 = this.__global_left_sidebar_01(step_contents_block_data(json, "01", "stats", "db_info_expanded"),false, 2);
    sidebar_1_datatypes = this.__gs_sidebar_1_datatypes(step_contents_data(json, "01", "summary", "table")["content_blocks"]);
    sidebar_1_findings = this.__gs_sidebar_1_findings(step_contents_block_data(json, "01", "stats", "column_analysis")["block_data"]);
    sidebar_1_actions = this.__gs_sidebar_1_actions(step_contents_data(json, "01", "summary", "table")["content_blocks"]);

    sidebar_2_actions = this.__gs_sidebar_2_actions(step_contents_data(json, "02", "summary", "table")["content_blocks"][0]["block_data"]);

    information_level = this.__global_information_level_v02(step_contents_data(json, "01", "summary")["content_blocks"]);
    stability_metric = this.__global_stability_metric_v02(step_contents_data(json, "01", "summary")["content_blocks"]);
    concentration_metric = this.__global_concentration_metric_v02(step_contents_data(json, "01", "summary")["content_blocks"]);
    apply_summary_transform = this.__global_apply_summary_v02(step_contents_block_data(json, "02", "summary", "table")["block_data"]);
    cpu_time = this.__global_cpu_time(step_contents_block_data(json, "01", "stats", "cpu_time")["block_data"]);

    total_value_cpu_0 = step_contents_block_data(json, "01", "stats", "cpu_time")["block_data"];
    total_value_cpu_0 = total_value_cpu_0["data"][total_value_cpu_0["index"].indexOf("total")];

    total_value_cpu_1 = step_contents_block_data(json, "02", "stats", "cpu_time")["block_data"];
    total_value_cpu_1 = total_value_cpu_1["data"][total_value_cpu_1["index"].indexOf("total")];

    left_sidebar_02 = this.__global_left_sidebar_02(step_contents_block_data(json, "01", "stats", "column_analysis"),false, 4);
    left_sidebar_03 = this.__global_action_table(step_contents_block_data(json, "02", "stats", "results"));
    left_sidebar_04 = this.__global_left_sidebar_output_data_v02(
    step_contents_block_data(json, "01", "stats", "db_info_expanded").block_data,
    step_contents_block_data(json, "02", "stats", "results").block_data);         

    let recommended_actions = this.__global_actions(step_contents_data(json, "01", "summary", "table")["content_blocks"]);
    //let applied_actions = this.__global_actions(step_contents_data(json, "02", "summary", "table")["content_blocks"]);
    // -------------------------------------------------------------------------
    // Template
    // -------------------------------------------------------------------------
    let html = '';

    html += '<div class="pos_sidebar_left">';

    html += '<div class="element dashed input">';  
    html += '<div><h1 class="title">Input</h1></div>';
    html += left_sidebar_01;
    html += '</div>';

    let step_css_class='';
    if(exists_apply) step_css_class='chain';
    html += '<div class="element process_step '+step_css_class+'">';  
    html += '<div><h1 class="title">1. Analysis step</h1></div>';   
    html += '<div><h1 class="subtitle">Variable datatypes:</h1></div>';
    html += sidebar_1_datatypes;
    html += '<details>';
    html += '<summary>';
    html += '<div><h1 class="subtitle">Findings:</h1></div>';
    html += '</summary>';
    html += sidebar_1_findings;    
    html += '</details>';
    html += '<div><h1 class="subtitle">Recommended actions:</h1></div>';
    html += sidebar_1_actions;    
    html += '<div class="block">' + '<h1 class="subtitle">' + 'Process time: ';
    html += '<span class="block_title_extra">' + total_value_cpu_0.toFixed(2) + 's</span>' +'</h1>';
    html += '</div>';
    html += '</div>';

    if(exists_apply){
        html += '<div class="element process_step">';          
        html += '<div><h1 class="title">2. Transform step</h1></div>';   
        html += '<div><h1 class="subtitle">Applied actions:</h1></div>';        
        //html += left_sidebar_03;
        html += sidebar_2_actions;
        html += '<div class="block">';
        html += '<h1 class="block_subtitle">' + 'by datatype: ' + '</h1>';
        html += '<div class="echart_chart"  style="width:calc(100% - 20px);height: 80px;" id="' + apply_summary_transform.html_element_id + '"></div>';
        html += '<h1 class="block_subtitle">' + 'Process time: ';
        html += '<span class="block_title_extra">' + total_value_cpu_1.toFixed(2) + 's</span>' + '</h1>';
        html += '</div>';
        html += '</div>';

        html += '<div class="element dashed output">';  
        html += '<div><h1 class="title">Output</h1></div>';
        html += left_sidebar_04;
        html += '</div>';
    }

    html += '</div>';

    html += '<div class="pos_mainbody">';
    html += '<div class="row1">';
    html += '<div><h1 class="global_subtitle">Information level</h1></div>';
    html += '<span class="text"></span>';    
    html += '<div class="echart_chart" style="padding: 30px 25px;" id="' + information_level.html_element_id + '"></div>';
    html += '</div>'
    html += '<div class="row21">';
    html += '<h1 class="global_subtitle">Divergence metric (by datatype)</h1>';
    html += '<span class="text"></span>';
    html += '<div class="echart_chart" style="padding: 35px 20px;" id="' + stability_metric.html_element_id + '"></div>';
    html += '</div>';
    html += '<div class="row22">';
    html += '<h1 class="global_subtitle">Concentration metric (by datatype)</h1>';
    html += '<span class="text"></span>';    
    html += '<div class="echart_chart" style="padding: 35px 20px;" id="' + concentration_metric.html_element_id + '"></div>';

    html += '</div>';
    html += '</div>';

    // -------------------------------------------------------------------------
    // Prepare results
    // -------------------------------------------------------------------------
    results.graphs.push(information_level);
    results.graphs.push(stability_metric);
    results.graphs.push(concentration_metric);
    results.graphs.push(apply_summary_transform);
    //results.graphs.push(cpu_time);
    results.html = html;
    // Filter boxes with no graphs
    results.graphs = results.graphs.filter(function(value){return value != ''});

    return results;
};

univariate.step_process_custom = function(item,step_id) {
    let step = item.steps[step_id];
    if (this.general_summary && step_id == '00'){
        let contents = this.__global_boxes_prepare_contents(item.data);
        step.graphs = contents.graphs;
        //step.datatables = [];
        let custom_class = 'univariate_general_summary';
        step.html='<div class="step '+custom_class+'">'+contents.html+'</div>';  
        step.status = 'processed';
        return step;
    }
    return null;
}