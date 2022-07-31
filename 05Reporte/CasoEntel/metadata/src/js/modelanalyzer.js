var modelanalyzer = new GRMlab();
modelanalyzer.module_name='modelanalyzer';
modelanalyzer.general_summary = true;

modelanalyzer.color_custom = { 
    axisLabelColor: '#8999b9',
    axisLineColor: '#8999b9',
    inactive_color: '#57698c',
    color_background_1: '#d9dce1',
    color_sidebar_letter: '#999999',
    color_sidebar_value: '#dddddd',

    missings: '#e65068',
    specials: '#ea9234',
    informed: '#49a5e6',
};
modelanalyzer.__tooltip_position = function(point, params, dom, rect, size, align){

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
modelanalyzer.assign_field_renderer_custom = function(field_name,scope,data_type) {
    let renderer = new Object();
    renderer.name='';
    renderer.class='';
    renderer.format_number = '';
    renderer.color_map = new color_mapper({type:null});

    switch (field_name) {
        case '#color#': 
            renderer.name='colorbox';
            break;
        case 'hidden': 
            renderer.name='none';
            break;
        case 'metric_name':
            renderer= new field_renderer({
                type:'lite-modal',
                data_type:data_type,
            });
            renderer.set_data = function(table_data,row,col,column_positions) {
                let value = table_data[row][col];
                let data = table_data[row][column_positions['hidden']];
                let modal_content = '';
                let graphs = [];
                modal_content += data;
                this.data= {
                    label:value,
                    modal_content:modal_content,
                    graphs: graphs
                    };
            }
            break;   
        case 'global_value':
            renderer= new field_renderer({
                type:'num',
                data_type:data_type,
                cell_align:'center',
                value_format:fmt_dec_3,
            });
            break;
        case 'coeff.':
            renderer= new field_renderer({
                type:'num',
                data_type:data_type,
                cell_align:'right',
                value_format:fmt_dec_3,
            });
            break;
        case 'vif':
            renderer= new field_renderer({
                type:'num',
                data_type:data_type,
                cell_align:'center',
                value_format:fmt_dec_2,
            });
            break;
        case 'name':
            renderer.name='string';
            //renderer.tooltip=true;
            //renderer.max_length = 10;
            renderer.class='left';
            renderer.style='padding-left:5px;';
            //break;
            //renderer.name="raw";
            break;
        //    renderer.name='linked_variable';
        //    break;
        case 'importance':
            renderer= new field_renderer({
                type:'bar',
                data_type:'table',
                container_css:'padding-left:15px;',
                cell_align:'right',
                value_position:'top',
                value_align:'left',
                value_max:1,
                value_css_class:'f10',
                value_format:fmt_pct_2_2,
                //value_color_map:,                         
                bar_width:'70px',
                bar_color_map:
                    new color_mapper({
                        type : 'numeric',
                        data_list : [0.045, 0.05, 0.25, 0.3, null],
                        color_list : ['red_1', 'orange_1', 'blue_1' ,'orange_1', 'red_1']
                    }),
                init_renderer : function(table_data,column_positions) {
                    let column_index = column_positions['importance'];
                    let value_max = table_data[0][column_index];
                    for (let i = 1; i < table_data.length; i++) {
                        if (table_data[i][column_index] > value_max) {
                            value_max = table_data[i][column_index];
                        }
                    }
                    this.value_max = value_max;
                },
            });
            break;
    }
    if (renderer.name=='') return null;
    else return renderer;
}
modelanalyzer.__global_left_sidebar_01 = function (tables_data, big_elements = 999, table_elements = 999) {
    let html = "";
    let block_options = 
            {
                title: null,
                params: {
                    big_elements:big_elements,
                    small_elements:table_elements,
                    table_css_class: 'no_border'
                },
                data:{
                    labels:tables_data.index,
                    values:tables_data.data
                }
            };
    html+=this.block_render_big_numbers(block_options);
    return html;
};
modelanalyzer.__global_left_sidebar_02 = function (tables_data, num_elements = 999, table_elements = 999) {
    let html = "";
    let block_options = 
            {
                title: null,
                params: {
                    num_elements:num_elements,
                },
                data:{
                    labels:tables_data.index,
                    values:tables_data.data
                }
            };
    html+=this.block_render_table(block_options);
    return html;
};
modelanalyzer.__confussion_matrix = function(v_data, names_rand){
    let html = '';

    let precision_tooltip = '<div style="width: 0px" class="tooltip icon_info">';
    precision_tooltip += '<span class="tooltiptext left">';
    precision_tooltip += 'Precision for P and N:';
    precision_tooltip += '<div calss="block_table"><table>';
    precision_tooltip += '<tr><td class="left">Positive predicted value (PPV):</td><td class="value left">TP/(TP+FP)</td></tr>';
    precision_tooltip += '<tr><td class="left">Negative predicted value (NPV):</td><td class="value left">TN/(TN+FN)</td></tr>';
    precision_tooltip += '</table></div>';
    precision_tooltip += '</span></div>';

    let lift_tooltip = '<div style="width: 0px" class="tooltip icon_info">';
    lift_tooltip += '<span class="tooltiptext left">';
    lift_tooltip += 'Improved precision of PPV and NPV over random sampling';
    lift_tooltip += '</span></div>';

    let confusion_tooltip = '<div style="width: 4px" class="tooltip icon_info">';
    confusion_tooltip += '<span class="tooltiptext left">';
    confusion_tooltip += 'Confusion matrix elements:';
    confusion_tooltip += '<div calss="block_table"><table>';
    confusion_tooltip += '<tr><td class="value left">TP:</td><td class="left">True positives</td></tr>';
    confusion_tooltip += '<tr><td class="value left">FN:</td><td class="left">False negatives (type II error)</td></tr>';
    confusion_tooltip += '<tr><td class="value left">FP:</td><td class="left">False positives (type I error)</td></tr>';
    confusion_tooltip += '<tr><td class="value left">TN:</td><td class="left">True negatives</td></tr>';
    confusion_tooltip += '</table></div>';
    confusion_tooltip += 'Rates:';
    confusion_tooltip += '<div calss="block_table"><table>';
    confusion_tooltip += '<tr><td class="left">True positive rate (TPR):</td><td class="value left">TP/(TP+FN)</td></tr>';
    confusion_tooltip += '<tr><td class="left">False negative rate (FNR):</td><td class="value left">FN/(TP+FN)</td></tr>';
    confusion_tooltip += '<tr><td class="left">False positive rate (FPR):</td><td class="value left">FP/(TN+FP)</td></tr>';
    confusion_tooltip += '<tr><td class="left">True negative rate (TNR):</td><td class="value left">TN/(TN+FP)</td></tr>';
    confusion_tooltip += '</table></div>';
    confusion_tooltip += '</span></div>';

    // confussion matrix
    html += '<div class="block_table_confusion">';
    html += '<div style="width:100%">';

    html += '<table style="width:100%;margin:10px 0px 20px 0px;">';
    html += '<tr>'
    html += '<td></td><td colspan="4">Actual values</td><td></td><td></td></tr>';
    html += '<tr>';
    html += '<tr style="border-bottom: solid 1.4px'+color.aqua_medium+';">'
    html += '<td class="td_right_line_s">'+confusion_tooltip+'</td><td colspan="2">1</td><td colspan="2">0</td><td>Prec. '+precision_tooltip+'</td><td>Lift '+lift_tooltip+'</td></tr>';
    html += '<tr>';
    html += '<td style="border-right: solid 1.4px '+color.aqua_medium+';">1</td>';
    html += '<td class="left">TP:</td>';
    html += '<td style="border-right: dashed 1.4px '+color.aqua_medium+';" class="value left">';
    html += format_number(v_data["tp"]["global_value"]) + '</td>';
    html += '<td class="left">FP:</td>';
    html += '<td style="border-right: dashed 1.4px '+color.aqua_medium+';" class="value left">';
    html += format_number(v_data["fp"]["global_value"])+'</td>';
    html += '<td class="value">'+fmt_pct_2_2.format(v_data["ppv"]["global_value"])+'</td>';
    html += '<td class="value">'+fmt_dec_2.format(v_data["lift_p"]["global_value"])+'x</td>';
    html += '</tr>';
    html += '<tr>';
    html += '<td style="border-right: solid 1.4px '+color.aqua_medium+';"></td>';
    html += '<td style="border-bottom: dashed 1.4px '+color.aqua_medium+';" class="left">TPR:</td>';
    html += '<td style="border-right: dashed 1.4px '+color.aqua_medium+';border-bottom: dashed 1.4px '+color.aqua_medium+';" class="value left">';
    html += fmt_pct_2_2.format(v_data["tpr"]["global_value"])+'</td>';
    html += '<td style="border-bottom: dashed 1.4px '+color.aqua_medium+';" class="left">FPR:</td>';
    html += '<td style="border-right: dashed 1.4px '+color.aqua_medium+';border-bottom: dashed 1.4px '+color.aqua_medium+';" class="value left">';
    html += fmt_pct_2_2.format(v_data["fpr"]["global_value"])+'</td>';
    html += '<td></td>';
    html += '<td></td>';
    html += '</tr>';
    html += '<tr>';
    html += '<td style="border-right: solid 1.4px '+color.aqua_medium+';">0</td>';
    html += '<td class="left">FN:</td>';
    html += '<td style="border-right: dashed 1.4px '+color.aqua_medium+';" class="value left">';
    html += format_number(v_data["fn"]["global_value"])+'</td>';
    html += '<td class="left">TN:</td>';
    html += '<td style="border-right: dashed 1.4px '+color.aqua_medium+';" class="value left">';
    html += format_number(v_data["tn"]["global_value"])+'</td>';
    html += '<td class="value">'+fmt_pct_2_2.format(v_data["npv"]["global_value"])+'</td>';
    html += '<td class="value">'+fmt_dec_2.format(v_data["lift_n"]["global_value"])+'x</td>';
    html += '</tr>';
    html += '<tr>';
    html += '<td style="border-right: solid 1.4px '+color.aqua_medium+';"></td>';
    html += '<td class="left">FNR:</td>';
    html += '<td style="border-right: dashed 1.4px '+color.aqua_medium+';" class="value left">';
    html += fmt_pct_2_2.format(v_data["fnr"]["global_value"])+'</td>';
    html += '<td class="left">TNR:</td>';
    html += '<td style="border-right: dashed 1.4px '+color.aqua_medium+';" class="value left">';
    html += fmt_pct_2_2.format(v_data["tnr"]["global_value"])+'</td>';
    html += '<td></td>';
    html += '<td></td>';
    html += '</tr>';
    html += '</table>';

    html+='</div>';
    html+='</div>';

    /*
    html += '<table style="width:55%;margin:10px 0px 20px 0px;">';
    html += '<tr>';
    html += '<td style="text-align:left;">Accuracy:</td>';
    html += '<td style="text-align:right;" class="value">'+format_number(v_data["accuracy"]["global_value"])+'</td></tr>';
    html += '<tr>';
    html += '<td style="text-align:left;">Youden Index:</td>';
    html += '<td style="text-align:right;" class="value">'+format_number(v_data["youden"]["global_value"])+'</td></tr>';
    html += '<tr>';
    html += '<td style="text-align:left;">Log-Loss:</td>';
    html += '<td style="text-align:right;" class="value">'+format_number(v_data["log_loss"]["global_value"])+'</td></tr>';
    html += '</table>';

    html+='</div>';
    html+='</div>';

    html += '<div class="big_number_4" style="margin:10px 0px">';
    for(i in names_rand){
        html += '<div class="big_element" style="width:30%">';
        html += '<div>';
        html += '<span class="label xt_missing" style="font-size:15px;">'+names_rand[i]+'</span>';
        html += '</div>';
        html += '<div class="main_value"><span class="main_value_small">'+fmt_dec_3.format(v_data[names_rand[i]]["global_value"])+'</span>';
        html += '</div>';
        html += '<div class="extra">+/-'+fmt_dec_3.format(v_data[names_rand[i]]["std_rand"]*1.96)+'</div>';
        html += '</div>';
    }
    html+='</div>';
    */

    return {html: html, graphs: ''};
};
modelanalyzer.__roc_plot = function(data){

	// initialization
    var data_roc = [];

    // Line Graph data
    for (i = 0; i < data["tpr"].length; i++){
        data_roc.push([data["fpr"][i] , data["tpr"][i]]); 
    }

    // Figure colors
    var color_01 = color.aqua;
    var color_02 = color.aqua_dark;
    var color_03 = color.medium_blue_light;
    var color_04 = color.core_blue_light;

	// graph
    var option = {
        color: [color_01, color_02, color_03, color_04],
        tooltip: {
            trigger: 'axis',
            axisPointer:{
                type: 'line'
            },
            position: function (point, params, dom, rect, size) {
                return this.modelanalyzer.__tooltip_position(point, params, dom, rect, size);
            },
            formatter: function(params){
                let html = "";
                html += "<div class='tooltip'>";
                html += "<span class='u blue_labels'>ROC</span>";
                html += "<p class='blue_labels'>With the threshold at this point:</p>";
                html += "<div>";
                html += "<table>";
                html += "<tr style='vertical-align: top;'>";
                html += '<td class="element" style="color:' + params[0].color + '">&#x25b0;</td> ';
                html += "<td class='blue_labels'>";
                html += '<span class="i">%FPR:</span></td>';
                html += "<td class='right value'>";
                html += fmt_pct_0_2.format(params[0].value[0]);
                html += "</td></tr>";
                html += "<tr style='vertical-align: top;'>";
                html += '<td ></td> ';
                html += "<td class='blue_labels'>";
                html += '<span class="i">%TPR:</span></td>';
                html += "<td class='right value'>";
                html += fmt_pct_0_2.format(params[0].value[1]);
                html += "</td></tr>";
                html += "</table>";
                html += "</div>";
                html += "</div>";
                return html;
            },
            extraCssText: ec_tooltip,
        },
        /*legend: {
            inactiveColor: this.color_custom.inactive_color,
            itemGap: 10,
            symbolKeepAspect:true,itemHeight:11,itemWidth:13,            
            pageButtonItemGap: 0,
            data:[{
                name:'roc',
                icon: "rect"
            },{
                name: "random",
                icon: 'rect'
            }],
            textStyle:{color: this.color_custom.axisLabelColor},
        },*/
        grid:{
            left: '5%',
            right: '5%',
            bottom: '15%',
            top: '10%',
            containLabel: true,
            show: true,
            borderColor: color.core_blue
        },
        xAxis: {
            type: 'value',
            splitLine: { 
                show: false
            },
            axisLabel: {
                color: this.color_custom.axisLabelColor, 
                formatter: function(x){ return fmt_pct_0_2.format(x);},
            },
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
            name: "%FPR",
            nameLocation: "middle",
            nameGap: 24,
            min:0,
            max:1,
        },
        yAxis: {
            type: 'value',
            splitLine: { 
                show: false
            },
            axisLabel: {
                color: this.color_custom.axisLabelColor,
                formatter: function(x){ return fmt_pct_0_2.format(x);},
            },
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
            name: "%TPR",
            nameLocation: "middle",
            nameRotate: 90,
            nameGap: 35,
            min:0,
            max:1,
        },
        series: [
            {
                name:'random',
                type:'line',
                symbol: 'none',
                data: [[0,0],[1,1]],
                lineStyle:{
                    color: color_02,
                    type: 'dashed'
                },
            }/*,{
                name:'perfect',
                type:'line',
                symbol: 'none',
                data: [[0,0],[0,1],[1,1]],
                lineStyle:{
                    color: color_02,
                    type: 'dashed'
                },
            }*/,{
                name:'roc',
                type:'line',
                symbol: 'none',
                data: data_roc,
                lineStyle:{
                    color: color_01,
                    type: 'solid'
                },
            }
        ]
    };
    // plots
    let chart = this.echarts_prepare_chart(option,{});
    return chart;
};
modelanalyzer.__scatter_plot = function(data, short_name){

    // initialization
    var data_scatter = [];
    var x_data = [];

    // Line Graph data
    for (i = 0; i < data["values_rand"].length; i++){
        x_data.push(i)
        data_scatter.push([i , data["values_rand"][i]]); 
    }

    let min_val = Math.min(data_scatter.map(function(x){return x[1]}))
    let max_val = Math.max(data_scatter.map(function(x){return x[1]}))

    // Figure colors
    var color_01 = color.aqua;
    var color_02 = color.aqua_dark;
    var color_03 = color.medium_blue_light;
    var color_04 = color.core_blue_light;

    // graph
    var option = {
        color: [color_01, color_02, color_03, color_04],
        tooltip: {
            trigger: 'item',
            axisPointer:{
                type: 'none'
            },
            /*position: function (point, params, dom, rect, size) {
                return this.modelanalyzer.__tooltip_position(point, params, dom, rect, size);
            },*/
            formatter: function(params){
                let html = "";
                html += "<div class='tooltip'>";
                html += "<span class='u blue_labels'>Simulated value</span>";
                html += "<div>";
                html += "<table>";
                html += "<tr style='vertical-align: top;'>";
                html += '<td class="element" style="color:' + params.color + '">&#x25b0;</td> ';
                html += "<td class='blue_labels'>";
                html += '<span class="i">' + params.seriesName + ':</span></td>';
                html += "<td class='right value'>";
                html += fmt_dec_3.format(params.value[1]);
                html += "</td></tr>";
                html += "</table>";
                html += "</div>";
                html += "</div>";
                return html;
            },
            extraCssText: ec_tooltip,
        },
        grid:{
            left: '10%',
            right: '10%',
            bottom: '5%',
            top: '5%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            show: false
        },
        yAxis: {
            type: 'value',
            splitLine: { 
                show: false
            },
            axisLabel: {
                color: this.color_custom.axisLabelColor,
            },
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
            name: data["name"],
            nameLocation: "middle",
            nameRotate: 90,
            nameGap: 45,
            scale: true,
        },
        series: [
            {
                name:short_name,
                type:'scatter',
                symbolSize: 5,
                symbol: 'circle',
                data: data_scatter,
            },{
                name:"global_value",
                type:'line',
                symbol: "none",
                data: [[0, data["global_value"]],[data["values_rand"].length-1, data["global_value"]]],
                lineStyle:{
                    color: color.BP_100,
                    type: 'dotted',
                },
                z: 10
            },{
                name: String(Math.round(data["global_value"]*10000)/10000),
                type:'scatter',
                symbolSize: 0,
                data: [[data["values_rand"].length-1, data["global_value"]]],
                label: {
                    show: true,
                    position:"right",
                    fontWeight: 'bold',
                    color: color.BP_100,
                    formatter: '{a}',
                },
                z: 10
            },{
                name:short_name,
                type:'line',
                symbol: 'none',
                data: [[0, data["p99_rand"]],[data["values_rand"].length-1, data["p99_rand"]]],
                lineStyle:{
                    color: color.red_medium,
                    type: 'dashed',
                },
                z: 10
            },{
                name:"P-99",
                type:'scatter',
                symbolSize: 0,
                data: [[data["values_rand"].length-1, data["p99_rand"]]],
                label: {
                    show: true,
                    position:"right",
                    fontWeight: 'bold',
                    color: color.red_medium,
                    formatter: '{a}',
                },
                z: 10
            },{
                name:short_name,
                type:'line',
                symbol: 'none',
                data: [[0, data["p1_rand"]],[data["values_rand"].length-1, data["p1_rand"]]],
                lineStyle:{
                    color: color.red_medium,
                    type: 'dashed',
                },
                z: 10
            },{
                name:"P-1",
                type:'scatter',
                symbolSize: 0,
                data: [[data["values_rand"].length-1, data["p1_rand"]]],
                label: {
                    show: true,
                    position:"right",
                    fontWeight: 'bold',
                    color: color.red_medium,
                    formatter: '{a}',
                },
            },{
                name:short_name,
                type:'line',
                symbol: 'none',
                data: [[0, data["p25_rand"]],[data["values_rand"].length-1, data["p25_rand"]]],
                lineStyle:{
                    color: color.BP_400,
                    type: 'dashed',
                },
                z: 10
            },{
                name:"P-25",
                type:'scatter',
                symbolSize: 0,
                data: [[data["values_rand"].length-1, data["p25_rand"]]],
                label: {
                    show: true,
                    position:"right",
                    fontWeight: 'bold',
                    color: color.BP_400,
                    formatter: '{a}',
                },
            },{
                name:short_name,
                type:'line',
                symbol: 'none',
                data: [[0, data["p75_rand"]],[data["values_rand"].length-1, data["p75_rand"]]],
                lineStyle:{
                    color: color.BP_400,
                    type: 'dashed',
                },
                z: 10
            },{
                name:"P-75",
                type:'scatter',
                symbolSize: 0,
                data: [[data["values_rand"].length-1, data["p75_rand"]]],
                label: {
                    show: true,
                    position:"right",
                    fontWeight: 'bold',
                    color: color.BP_400,
                    formatter: '{a}',
                },
            },{
                name:short_name,
                type:'line',
                symbol: 'none',
                data: [[0, data["p95_rand"]],[data["values_rand"].length-1, data["p95_rand"]]],
                lineStyle:{
                    color: color.red_light,
                    type: 'dashed',
                },
                z: 10
            },{
                name:"P-95",
                type:'scatter',
                symbolSize: 0,
                data: [[data["values_rand"].length-1, data["p95_rand"]]],
                label: {
                    show: true,
                    position:"right",
                    fontWeight: 'bold',
                    color: color.red_light,
                    formatter: '{a}',
                },
            },{
                name:short_name,
                type:'line',
                symbol: 'none',
                data: [[0, data["p5_rand"]],[data["values_rand"].length-1, data["p5_rand"]]],
                lineStyle:{
                    color: color.red_light,
                    type: 'dashed',
                },
                z: 10
            },{
                name:"P-5",
                type:'scatter',
                symbolSize: 0,
                data: [[data["values_rand"].length-1, data["p5_rand"]]],
                label: {
                    show: true,
                    position:"right",
                    fontWeight: 'bold',
                    color: color.red_light,
                    formatter: '{a}',
                },
            }
        ]
    };
    // plots
    let chart = this.echarts_prepare_chart(option,{});
    return chart;
};
modelanalyzer.__time_analysis = function(data){

    // Figure colors
    var color_01 = color.aqua;
    var color_02 = color.aqua_dark;
    var color_03 = color.medium_blue_light;
    var color_04 = color.core_blue_light;

    let x_tics = []
    for (i = 0; i < data["intervals_temporal"].length; i++){
        x_tics.push(data["intervals_temporal"][i]); 
    }

	// graph
    var option = {
        color: [color_01, color_02],
        tooltip: {
            trigger: 'axis',
            axisPointer:{
                type: 'shadow'
            },
            position: function (point, params, dom, rect, size) {
                return this.modelanalyzer.__tooltip_position(point, params, dom, rect, size);
            },
            formatter: function(params){
                let html = "";
                html += "<div class='tooltip'>";
                html += "<span class='u blue_labels'>Time analysis</span>";
                html += "<p class='blue_labels'>Time Window: [" + params[0].axisValue + "]</p>";
                html += "<div>";
                html += "<table>";
                for (i = 0; i < (params.length-1); i++){
                    html += "<tr style='vertical-align: top;'>";
                    html += '<td class="element" style="color:' + params[i].color + '">&#x25b0;</td> ';
                    html += "<td class='blue_labels'>";
                    html += '<span class="i">' + params[i].seriesName + ':</span></td>';
                    html += "<td class='right value'>";
                    html += fmt_dec_3.format(params[i].value);
                    html += "</td></tr>";
                }
                // count
                html += "<tr style='vertical-align: top;'>";
                html += '<td class="element" style="color:' + params[params.length-1].color + '">&#x25b0;</td> ';
                html += "<td class='blue_labels'>";
                html += '<span class="i">' + params[params.length-1].seriesName + ':</span></td>';
                html += "<td class='right value'>";
                html += fmt_dec_max1.format(params[params.length-1].value);
                html += "</td></tr>";

                html += "</table>";
                html += "</div>";
                html += "</div>";
                return html;
            },
            extraCssText: ec_tooltip,
        },
        legend: {
            type: 'scroll',
        	selectedMode: "single",
            inactiveColor: this.color_custom.inactive_color,
            itemGap: 10,
            symbolKeepAspect: true, itemHeight:11,itemWidth:13,            
            pageButtonItemGap: 0,
            data: data["metrics_temporal"].map(function(x){
                return {name: x, icon: "rect"}
            }),
            padding: 0,
            textStyle:{color: this.color_custom.axisLabelColor},
        },
        /*legend:{
            data: data["metrics_temporal"],
            selectedMode: "single",
            inactiveColor: this.color_custom.inactive_color,
            textStyle:{color: this.color_custom.axisLabelColor},
            type: 'scroll',
            //padding: 0//[10,10,10,10],
        },*/
        grid:{
            left: '15%',
            right: '7%',
            bottom: '10%',
            top: '10%',
            containLabel: true
        },
        xAxis: [{
            type: 'category',
            data: x_tics,
            splitLine: { 
                show: false
            },
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
            nameLocation: "middle",
            nameGap: 30,
            axisLabel: {
                formatter: function(x){ return x.slice(0,6);}
            },
        },
        {
            type: 'category',
            data: x_tics,
            splitLine: { 
                show: false
            },
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
            name: "time",
            nameLocation: "middle",
            nameGap: 30,
            show: false,
            axisTick:{show: false},
            axisLabel:{show: false},
            axisLine:{show: false}
        }],
        yAxis: [{
            type: 'value',
            splitLine: { 
                show: false
            },
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
            name: "1 year mean value",
            nameLocation: "middle",
            nameRotate: 90,
            nameGap: 35,
        },
        {
            type: 'value',
            splitLine: { 
                show: false
            },
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
            name: "count (x1000)",
            nameLocation: "middle",
            nameRotate: 90,
            nameGap: 35,
            axisLabel: {
                color: this.color_custom.axisLabelColor, 
                formatter: function(x){ return x/1000;},
            },
        }],
        series: [{
        	name: "counts",
            type:'bar',
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: data["count_temporal"],
            itemStyle:{
                color: color.core_blue,
                type: 'solid',
                opacity: 0.5,
            },
        }]
    };
    for (i in data["metrics_temporal"]){
    	option.series.push(
    		{
                name:data["metrics_temporal"][i],
                type:'line',
	            xAxisIndex: 0,
	            yAxisIndex: 0,
                symbol: 'none',
                data: data["metrics"][data["metrics_temporal"][i]]["temporal"],
                lineStyle:{
                    color: color_02,
                    type: 'solid',
                },
            }
    	)
    	option.legend.data.push({name:data["metrics_temporal"][i], icon: "rect"})
    }
    
    // plots
    let chart = this.echarts_prepare_chart(option,{});
    return chart;
};
modelanalyzer.__time_analysis_metric = function(data, metric){

    // Figure colors
    var color_01 = color.aqua;
    var color_02 = color.aqua_dark;
    var color_03 = color.medium_blue_light;
    var color_04 = color.core_blue_light;

    let x_tics = []
    for (i = 0; i < data["intervals_temporal"].length; i++){
        x_tics.push(data["intervals_temporal"][i]); 
    }

    // graph
    var option = {
        color: [color_01, color_02],
        tooltip: {
            trigger: 'axis',
            axisPointer:{
                type: 'shadow'
            },
            position: function (point, params, dom, rect, size) {
                return this.modelanalyzer.__tooltip_position(point, params, dom, rect, size);
            },
            formatter: function(params){
                let html = "";
                html += "<div class='tooltip'>";
                html += "<span class='u blue_labels'>Time analysis</span>";
                html += "<p class='blue_labels'>Time Window: [" + params[0].axisValue + "]</p>";
                html += "<div>";
                html += "<table>";
                for (i = 0; i < (params.length-1); i++){
                    html += "<tr style='vertical-align: top;'>";
                    html += '<td class="element" style="color:' + params[i].color + '">&#x25b0;</td> ';
                    html += "<td class='blue_labels'>";
                    html += '<span class="i">' + params[i].seriesName + ':</span></td>';
                    html += "<td class='right value'>";
                    html += fmt_dec_3.format(params[i].value);
                    html += "</td></tr>";
                }
                // count
                html += "<tr style='vertical-align: top;'>";
                html += '<td class="element" style="color:' + params[params.length-1].color + '">&#x25b0;</td> ';
                html += "<td class='blue_labels'>";
                html += '<span class="i">' + params[params.length-1].seriesName + ':</span></td>';
                html += "<td class='right value'>";
                html += fmt_dec_max1.format(params[params.length-1].value);
                html += "</td></tr>";

                html += "</table>";
                html += "</div>";
                html += "</div>";
                return html;
            },
            extraCssText: ec_tooltip,
        },
        /*legend: {
            inactiveColor: this.color_custom.inactive_color,
            itemGap: 10,
            symbolKeepAspect: true, itemHeight:11,itemWidth:13,            
            pageButtonItemGap: 0,
            data: data["metrics_temporal"].map(function(x){
                return {name: x, icon: "rect"}
            }),
            padding: 0,
            textStyle:{color: this.color_custom.axisLabelColor},
        },*/
        /*legend:{
            data: data["metrics_temporal"],
            selectedMode: "single",
            inactiveColor: this.color_custom.inactive_color,
            textStyle:{color: this.color_custom.axisLabelColor},
            type: 'scroll',
            //padding: 0//[10,10,10,10],
        },*/
        grid:{
            left: '10%',
            right: '3%',
            bottom: '10%',
            top: '10%',
            containLabel: true
        },
        xAxis: [{
            type: 'category',
            data: x_tics,
            splitLine: { 
                show: false
            },
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
            nameLocation: "middle",
            nameGap: 30,
            axisLabel: {
                formatter: function(x){ return x.slice(0,6);}
            },
        },
        {
            type: 'category',
            data: x_tics,
            splitLine: { 
                show: false
            },
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
            name: "time",
            nameLocation: "middle",
            nameGap: 30,
            show: false,
            axisTick:{show: false},
            axisLabel:{show: false},
            axisLine:{show: false}
        }],
        yAxis: [{
            type: 'value',
            splitLine: { 
                show: false
            },
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
            name: "1 year mean value",
            nameLocation: "middle",
            nameRotate: 90,
            nameGap: 45,
        },
        {
            type: 'value',
            splitLine: { 
                show: false
            },
            axisLine:{lineStyle: {color: color.core_blue_light}},
            //name: "count (x1000)",
            //nameLocation: "middle",
            //nameRotate: 90,
            //nameGap: 35,
            axisLabel: {
                color: color.core_blue_light,//this.color_custom.axisLabelColor, 
                formatter: function(x){ return x;},
            },
        }],
        series: [{
            name: "counts",
            type:'bar',
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: data["count_temporal"],
            itemStyle:{
                color: color.core_blue,
                type: 'solid',
                opacity: 0.5,
            },
        },{
            name:data["metrics"][metric]["name"],
            type:'line',
            xAxisIndex: 0,
            yAxisIndex: 0,
            symbol: 'none',
            data: data["metrics"][metric]["temporal"],
            lineStyle:{
                color: color_02,
                type: 'solid',
            },
        }]
    };
    
    // plots
    let chart = this.echarts_prepare_chart(option,{});
    return chart;
};
modelanalyzer.__metrics_data_table = function(json, scope){
    // initialization
    v_data = json["data"]["metrics"]
    let excluded = ["tp","tn", "fp", "fn", "tpr", "tnr", "fpr", "fnr", "ppv", "npv", "lift_n", "lift_p"];
    let graphs = [];
    // Metric details
    for (short_name in v_data){
        if (!excluded.includes(short_name)){
            if (v_data[short_name]["values_rand"] || v_data[short_name]["temporal"]){
                let html = '';
                html += '<div class="modelanalyzer_modal">';
                html += '<div class="row00_modal">';
                html +='<div><h1 class="modal_title">' + v_data[short_name]["name"];
                html += ' = ' + Math.round(v_data[short_name]["global_value"]*10000)/10000;
                if (v_data[short_name]["values_rand"]){
                    //'<span class="italic grey"> ('+v_data.type+')</span>'
                    html += '<i style="font-size:18px;"> (&#177 ' + Math.round(v_data[short_name]["std_rand"]*1.96*10000)/10000 + ')</i></h1></div>';
                    html += '</div>';
                    html += '<div class="row11_modal">';
                    html += '<div><h1 class="title f14">Metric details:</h1></div>';
                    html += '<div class="block_table">';
                    html += '<h1 class="block_subtitle">Parametric</h1>';
                    html += '<table style="width:95%">';
                    html += '<tr><td>Mean</td><td class="value">' + fmt_dec_3.format(v_data[short_name]["mean_rand"]) + '</td></tr>';
                    html += '<tr><td>Standard Deviation</td><td class="value">' + fmt_dec_3.format(v_data[short_name]["std_rand"]) + '</td></tr>';
                    html += '<tr><td>Skewness</td><td class="value">' + fmt_dec_3.format(v_data[short_name]["skew_rand"]) + '</td></tr>';
                    html += '<tr><td>Excess Kurtosis</td><td class="value">' + fmt_dec_3.format(v_data[short_name]["kurtosis_rand"]) + '</td></tr>';
                    html += '</table>';
                    html += '<h1 class="block_subtitle">Non-parametric</h1>';
                    html += '<table style="width:95%">';
                    html += '<tr><td>P-99</td><td class="value">' + fmt_dec_3.format(v_data[short_name]["p99_rand"]) + '</td></tr>';
                    html += '<tr><td>P-95</td><td class="value">' + fmt_dec_3.format(v_data[short_name]["p95_rand"]) + '</td></tr>';
                    html += '<tr><td>P-75</td><td class="value">' + fmt_dec_3.format(v_data[short_name]["p75_rand"]) + '</td></tr>';
                    html += '<tr><td>Median</td><td class="value">' + fmt_dec_3.format(v_data[short_name]["median_rand"]) + '</td></tr>';
                    html += '<tr><td>P-25</td><td class="value">' + fmt_dec_3.format(v_data[short_name]["p25_rand"]) + '</td></tr>';
                    html += '<tr><td>P-5</td><td class="value">' + fmt_dec_3.format(v_data[short_name]["p5_rand"]) + '</td></tr>';
                    html += '<tr><td>P-1</td><td class="value">' + fmt_dec_3.format(v_data[short_name]["p1_rand"]) + '</td></tr>';
                    html += '</table></div>';
                    html += '</div>';

                    html += '<div class="row22_modal">';
                    html += '<div><h1 class="title f14">Scatter plot:</h1></div>';
                    scatter_plot = this.__scatter_plot(v_data[short_name], short_name);
                    html += '<div class="echart_chart" id="' + scatter_plot.html_element_id + '"></div>';
                    graphs.push(scatter_plot);
                    html += '</div>';
                }
                else{
                    html += '</h1></div></div>';
                    html += '<div class="row11_modal">';
                    html += '<div><h1 class="title f14">Metric details:</h1></div>';
                    html += '</div>';
                    html += '<div class="row22_modal">';
                    html += '<div><h1 class="title f14">Scatter plot:</h1></div>';
                    html += "<div class='dashed_box'><div>Simulation not executed</div></div>";
                    html += '</div>';
                };
                html += '<div class="row12_modal">';
                html += '<div><h1 class="title f14">Temporal analysis:</h1></div>';
                if (v_data[short_name]["temporal"] != null){
                    time_plot = this.__time_analysis_metric(json["data"], short_name);
                    html += '<div class="echart_chart" id="' + time_plot.html_element_id + '"></div>';
                    graphs.push(time_plot);
                }
                else{
                    html += "<div class='dashed_box'><div>Temporal analysis not executed</div></div>";
                }
                html += '</div></div>';
                v_data[short_name]["html_metric"] = html;
            }
            else{
                v_data[short_name]["html_metric"] = null;
            }
        }
    };

    // Datatable data
    let datatable_columns = ["metric_name", "global_value", "error", "hidden"]
    let datatable_data = [];
    for (short_name in v_data){
        if (!excluded.includes(short_name)){
            if (v_data[short_name]["html_metric"] == null){
                name_metric =  '<div>'+v_data[short_name]["name"]+'</div>';
            }
            else{
                name_metric =  v_data[short_name]["name"] + ' <span class="icon_link"></span>';
            }
            error_value = (v_data[short_name]["std_rand"])?fmt_dec_3.format(v_data[short_name]["std_rand"]*1.96):null;
            html_values = (v_data[short_name]["html_metric"])
            datatable_data.push([name_metric, 
                                 v_data[short_name]["global_value"], 
                                 error_value, html_values]);
        }
    }
    //let datatable = view_datatable(datatable_columns,datatable_data,scope);
    let datatable = this.datatables_prepare_datatable({columns:datatable_columns,data:datatable_data}, scope,{datatable_class:'grid_datatable'})    
    let html = '';
    html += '<div><h1 class="global_subtitle">Metrics</h1></div>';
    html += '<div class="grid_datatable">';
    html += datatable.html;
    html += '</div>';
    return {html: html, datatables: datatable, graphs: graphs};
};
modelanalyzer.__features_data_table = function(v_data, scope){
    // Datatable data
    var datatable_data = v_data.data;
    var datatable_columns = v_data.info;

    var color_column= [];
    for (var i = 0; i < v_data.data.length; i++) {
        color_column.push(blue_1);
    }

    // Todo: Change. Aditional color_column
    var splits_pos = datatable_columns.indexOf("name");
    for (var i = 0; i < datatable_data.length; i++) {
        datatable_data[i] = datatable_data[i].slice(0);
        datatable_data[i].unshift(color_column[i]);
    }
    datatable_columns.unshift('#color#');
    //let datatable = view_datatable(datatable_columns,datatable_data,scope);
    let datatable = this.datatables_prepare_datatable({datatable_class:'grid_datatable',columns:datatable_columns,data:datatable_data}, scope,{datatable_class:'grid_datatable'})

    let html = '';
    html += '<div><h1 class="global_subtitle">Feature analysis</h1></div>';
    html += '<div class="grid_datatable">';
    html += datatable.html;
    html += '</div>';

    return {html: html, datatables: datatable};
};
modelanalyzer.__correlation_plot = function(v_data, max_feature_corr){

    // Metrics
    let statistics_corr = v_data["correlations"]["statistics"]

    // Figure colors
    var color_01 = color.aqua;
    var color_02 = color.aqua_dark;
    var color_03 = color.medium_blue_light;
    var color_04 = color.core_blue_light;
    let data_heat = [];
    let max = 0
    let x_tics = []
    let name_index = v_data["importance"]["info"].indexOf("name");

    for (i = 0; i < v_data["correlations"]["data"].length; i++){
        x_tics.push(v_data["importance"]["data"][i][name_index])
        for (j = 0; j < v_data["correlations"]["data"][i].length; j++){
            if (i==j){
                data_heat.push([v_data["correlations"]["info"][i],v_data["correlations"]["info"][j],null]); 
            }
            else{
                data_heat.push([v_data["correlations"]["info"][i],v_data["correlations"]["info"][j],Math.abs(v_data["correlations"]["data"][i][j])]); 
                max = (v_data["correlations"]["data"][i][j]>max)?v_data["correlations"]["data"][i][j]:max;
            }
        }
    }
    let max_value = Math.max(max, max_feature_corr)

    // graph
    var option = {
        color: [color_01, color_02],
        tooltip: {
            trigger: 'item',
            axisPointer:{
                type: 'shadow'
            },
            position: function (point, params, dom, rect, size) {
                return this.modelanalyzer.__tooltip_position(point, params, dom, rect, size);
            },
            formatter: function(params){
                let html = "";
                html += "<div class='tooltip'>";
                html += "<span class='u blue_labels'>Correlation</span>";
                html += "<p class='blue_labels'>" + params.data[1] + "</p>";
                html += "<p class='blue_labels'>" + params.data[0] + "</p>";
                html += "<div>";
                html += "<table>";
                    html += "<tr style='vertical-align: top;'>";
                    html += '<td class="element" style="color:' + params.color + '">&#x25b0;</td> ';
                    html += "<td class='right value'>";
                    html += fmt_pct_0_2.format(params.value[2]);
                    html += "</td></tr>";
                html += "</table>";
                html += "</div>";
                html += "</div>";
                return html;
            },
            extraCssText: ec_tooltip,
        },
        grid:{
            left: '5%',
            right: '5%',
            bottom: '15%',
            top: '0%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            splitLine: { 
                show: false
            },
            data: x_tics,
            axisLabel: {
                formatter: function(x){ return x_tics.indexOf(x)+1;}
            },
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
        },
        yAxis: {
            inverse: true,
            type: 'category',
            splitLine: { 
                show: false
            },
            data: x_tics,
            axisLabel: {
                formatter: function(x){ return x_tics.indexOf(x)+1;}
            },
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
        },
        visualMap: [{
            min: 0,
            max: max_value,
            calculable: true,
            realtime: false,
            precision: 2,
            orient: 'horizontal',
            itemWidth: 10,
            itemHeight: 140,
            hoverLink: true,
            padding: [0,0,10,80],
            textStyle:{color: this.color_custom.axisLineColor},
            borderColor: this.color_custom.color_background_1,
            borderWidth: 1,
            //controller:{inRange:{color: [this.color_custom.color_background_1, "#e65068"]}},
            inRange: {
                color: [this.color_custom.color_background_1, "#102641"]
            }
        }],
        series: {
            name: "correlation",
            type:'heatmap',
            data: data_heat
        }
    };
    
    // plots
    let chart = this.echarts_prepare_chart(option,{});

    function make_histogram(data, bins = 20, max = 1){
        var min = 0;
        var increment = (max - min) / bins;
        var hist_data = [];
        for (i = 0; i < bins; i++) {
            elt_num = data.filter(function(value){
                return (value <= (max - i * increment) && value > (max - (i+1) * increment))
            }).length;
            hist_data[bins-i-1] = [(max - (i+1)*increment), (max - i*increment), elt_num]
        }
        return hist_data;
    }
    corr_values = []
    for (i = 0; i < v_data["correlations"]["data"].length; i++){
        for (j = 0; j < i; j++){
            corr_values.push(Math.abs(v_data["correlations"]["data"][i][j]))
        }
    }
    let hist_corr = make_histogram(corr_values, bins = 10, max = 1)
    let corr_hist_y = hist_corr.map(function(x){return x[2]})
    let corr_hist_x = hist_corr.map(function(x){return [x[0], x[1]]})
    /*for (i = 1; i < statistics_corr.histogram.x.length; i++){
        corr_hist_x.push( [statistics_corr.histogram.x[i-1], statistics_corr.histogram.x[i]] )
    }*/

    let option_hist = {
        tooltip: {
            trigger: 'axis',
            axisPointer:{
                type: 'shadow'
            },
            formatter: function(params){
                let html = "";
                html += "<div class='tooltip'>";
                let interval = "[" + 
                    fmt_pct_0_2.format(params[0].axisValue.split(",")[0]) + "," + 
                    fmt_pct_0_2.format(params[0].axisValue.split(",")[1]) + "]";
                html += "<span class='blue_labels'>Corr. range: " + interval + " </span>";
                html += "<div>";
                html += "<table>";
                html += "<tr style='vertical-align: top;'>";
                html += '<td class="element" style="color:'+params[0].color+'">&#x25b0;</td> ';
                html += "<td class='blue_labels'>";
                html += '<span class="i">pairs in range:</span></td>';
                html += "<td class='right value'>";
                html += params[0].value;
                html += "</td></tr>";
                html += "</table>";
                html += "</div>";
                return html;
            },
            extraCssText: ec_tooltip,
        },
        grid:{
            left: '7%',
            right: '5%',
            bottom: '10%',
            top: '7%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: corr_hist_x,
            axisTick:{
                //interval:0
            },
            axisLabel:{
                color: this.color_custom.axisLabelColor,
                formatter: function(x){ return fmt_pct_0_2.format(x.split(",")[0]);},
                align: "right",
            },
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
            name: "correlation",
            nameLocation: "middle",
            nameGap: 30,
        },
        yAxis: {
            type: "value",
            splitLine: { 
                show: false
            },
            axisLabel: {
                color: this.color_custom.axisLabelColor,
                //formatter: function(x){ return fmt_pct_0_2.format(x);},
            },
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
            name: "num. variables pairs",
            nameLocation: "middle",
            nameRotate: 90,
            nameGap: 35,
        },
        series: {
            name: "correlations",
            data: corr_hist_y,//statistics_corr.histogram.y,
            type: 'bar',
            barMaxWidth: '75%',
            color: color.aqua_medium,
        },
    };
    let chart_hist = this.echarts_prepare_chart(option_hist,{});

    // lite
    let lite_html = '';
    lite_html += '<div class="lite-modal-button">';
    lite_html += 'Corr. Statistics';
    lite_html += '</div>';
    lite_html += '<div class="lite-modal" tabindex="-1">';
    lite_html += '<div class="modal_box">';
    lite_html += '<div class="modal_utils">';
    lite_html += '<span class="modal_close"></span>';
    lite_html += '</div>';
    lite_html += '<div class="modal_main_contents">';
    lite_html += '<div class="modelanalyzer_corr">';
    lite_html += '<div class="row00_corr">';
    lite_html +='<div><h1 class="modal_title">Correlation statistics</h1></div></div>';
    lite_html += '<div class="row11_corr">';
    lite_html += '<div><h1 class="title f14">Metric details:</h1></div>';
    lite_html += '<div class="block_table">';
    lite_html += '<h1 class="block_subtitle">Parametric</h1>';
    lite_html += '<table style="width:95%">';
    lite_html += '<tr><td>Mean</td><td class="value">' + fmt_pct_0_2.format(statistics_corr["mean_rand"]) + '</td></tr>';
    //lite_html += '<tr><td>Standard Deviation</td><td class="value">' + fmt_pct_0_2.format(statistics_corr["std_rand"]) + '</td></tr>';
    //lite_html += '<tr><td>Skewness</td><td class="value">' + fmt_dec_3.format(statistics_corr["skew_rand"]) + '</td></tr>';
    //lite_html += '<tr><td>Excess Kurtosis</td><td class="value">' + fmt_dec_3.format(statistics_corr["kurtosis_rand"]) + '</td></tr>';
    lite_html += '</table>';
    lite_html += '<h1 class="block_subtitle">Non-parametric</h1>';
    lite_html += '<table style="width:95%">';
    lite_html += '<tr><td>P-99</td><td class="value">' + fmt_pct_0_2.format(statistics_corr["p99_rand"]) + '</td></tr>';
    lite_html += '<tr><td>P-95</td><td class="value">' + fmt_pct_0_2.format(statistics_corr["p95_rand"]) + '</td></tr>';
    lite_html += '<tr><td>P-75</td><td class="value">' + fmt_pct_0_2.format(statistics_corr["p75_rand"]) + '</td></tr>';
    lite_html += '<tr><td>Median</td><td class="value">' + fmt_pct_0_2.format(statistics_corr["median_rand"]) + '</td></tr>';
    lite_html += '<tr><td>P-25</td><td class="value">' + fmt_pct_0_2.format(statistics_corr["p25_rand"]) + '</td></tr>';
    lite_html += '<tr><td>P-5</td><td class="value">' + fmt_pct_0_2.format(statistics_corr["p5_rand"]) + '</td></tr>';
    lite_html += '<tr><td>P-1</td><td class="value">' + fmt_pct_0_2.format(statistics_corr["p1_rand"]) + '</td></tr>';
    lite_html += '</table></div>';
    lite_html += '</div>';
    lite_html += '<div class="row12_corr">';
    lite_html += '<div><h1 class="title f14">Histogram:</h1></div>';
    lite_html += '<div class="echart_chart" id="' + chart_hist.html_element_id + '"></div>';
    lite_html += '</div>';
    lite_html += '</div>';
    lite_html += '</div>';
    lite_html += '</div>';
    lite_html += '</div>';

    let html = '';
    html += '<div class="block_table_2">';
    html += '<table style="width:88%;">';
    html += '<tr><td class="button_analysis">'+lite_html+'</td><td>P25: <span class="value">' + fmt_dec_3.format(statistics_corr["p25_rand"]) + '</span></td>';
    html += '<td>Median: <span class="value">' + fmt_dec_3.format(statistics_corr["mean_rand"]) + '</span></td>';
    html += '<td>P75: <span class="value">' + fmt_dec_3.format(statistics_corr["p75_rand"]) + '</span></td>';
    html += '</tr></table>';
    html += '</div>';
    html += '<div class="echart_chart" style="padding: 10px 5px;" id="' + chart.html_element_id + '"></div>';

    return {html: html, graphs: [chart, chart_hist]};
};
modelanalyzer.__global_boxes_prepare_contents = function(json){
    // -------------------------------------------------------------------------
    // Custom functions
    // -------------------------------------------------------------------------

    // -------------------------------------------------------------------------
    // Initialize
    // -------------------------------------------------------------------------
    let real_json = json["item_steps"][0]["step_contents"][0]["content_blocks"][0]["block_data"]
    let results = {html:'', graphs: [], datatables: [], content_class:''};
    let html = '';
    let scope = {item_type:'modelanalyzer',step_type:'analysis',place_type:'modal'};

    // -------------------------------------------------------------------------
    // Prepare data
    // -------------------------------------------------------------------------
    // Left sidebar
    left_sidebar_train = this.__global_left_sidebar_01(
    	real_json["data"]["model_characteristics"]["train_input"], 2);
    left_sidebar_test = this.__global_left_sidebar_01(real_json["data"]["test_input"], 2);
    left_sidebar_m_char = this.__global_left_sidebar_02(
    	real_json["data"]["model_characteristics"]["characteristics"], 3);
    left_sidebar_m_train = this.__global_left_sidebar_02(
        real_json["data"]["model_characteristics"]["train_input"]);
    left_sidebar_m_feat = this.__global_left_sidebar_02(
    	real_json["data"]["model_characteristics"]["feature_selection"]);
    left_sidebar_m_esti = this.__global_left_sidebar_02(
    	real_json["data"]["model_characteristics"]["estimator"]);
    name_analysis = real_json["data"]["characteristics"]["data"][
        real_json["data"]["characteristics"]["index"].indexOf("name")]
    left_sidebar_a_char = this.__global_left_sidebar_02(
        real_json["data"]["characteristics"]);
    left_sidebar_a_params = this.__global_left_sidebar_02(
    	real_json["data"]["run"]);
    total_value_cpu_a = real_json["data"]["cpu_time"]["data"][
    	real_json["data"]["cpu_time"]["index"].indexOf("total")];

    // Main body
    confussion_matrix = this.__confussion_matrix(real_json["data"]["metrics"], 
    											 real_json["data"]["metrics_random"]);
    roc_curve = this.__roc_plot(real_json["data"]["roc"]);
    //time_plot = this.__time_analysis(real_json["data"]);

    metrics_table = this.__metrics_data_table(real_json, scope);
    features_table = this.__features_data_table(real_json["data"]["features"]["importance"], scope);
    correlation_plot = this.__correlation_plot(real_json["data"]["features"], 
        real_json["data"]["model_characteristics"]["feature_selection"]["data"][
            real_json["data"]["model_characteristics"]["feature_selection"]["index"].indexOf("max_correlation")]);

    // -------------------------------------------------------------------------
    // Sidebar Left
    // -------------------------------------------------------------------------
    html += '<div class="pos_sidebar_left">';

    let step_css_class='chain';
    html += '<div class="element dashed_model plus">';
    html += '<div><h1 class="title">Model input</h1></div>';
    html += '<div><h1 class="subtitle">Main characteristics:</h1></div>';
    html += left_sidebar_m_char;
    html += '<details>';
    html += '<summary>';
    html += '<div><h1 class="subtitle">Train database:</h1></div>';
    html += '</summary>'; 
    html += left_sidebar_m_train;    
    html += '</details>';
    html += '<details>';
    html += '<summary>';
    html += '<div><h1 class="subtitle">Feature selection optimizer:</h1></div>';
    html += '</summary>'; 
    html += left_sidebar_m_feat;    
    html += '</details>';
    html += '<details>';
    html += '<summary>';
    html += '<div><h1 class="subtitle">Estimator:</h1></div>';
    html += '</summary>'; 
    html += left_sidebar_m_esti;
    html += '</details>';
    html += '</div>';

    html += '<div class="element dashed input">';  
    html += '<div><h1 class="title">Test input</h1></div>';
    html += left_sidebar_test;
    html += '</div>';

    html += '<div class="element process_step">';          
    html += '<div><h1 class="title">Analysis step</h1></div>'; 
    html += '<div class="block">' + '<h1 class="subtitle">' + 'Name: ';
    html += '<span class="block_title_extra">' + name_analysis + '</span>' + '</h1>';
    html += '</div>'; 
    html += '<div><h1 class="subtitle">Parameters:</h1></div>';
    html += left_sidebar_a_params;
    html += '<div class="block">' + '<h1 class="subtitle">' + 'Process time: ';
    html += '<span class="block_title_extra">' + total_value_cpu_a.toFixed(2) + 's</span>' + '</h1>';
    html += '</div>';
    html += '</div>';

    html += '</div>';

    // -------------------------------------------------------------------------
    // Main Body
    // -------------------------------------------------------------------------
    html += '<div class="pos_mainbody">';
    html += '<div class="row11">';
    html += '<div><h1 class="global_subtitle">Confusion matrix</h1></div>';
    html += '<div>'+confussion_matrix.html+'</div>'
    html += '<div><h1 class="global_subtitle">ROC</h1></div>';
    html += '<div class="echart_chart" style="padding: 0px 0px;" id="' + roc_curve.html_element_id + '"></div>';
    html += '</div>';
    html += '<div class="row12">';
    html += metrics_table.html
    html += '</div>'

    html += '<div class="row21">';
    html += features_table.html
    html += '</div>';

    html += '<div class="row22">';
    html += '<div><h1 class="global_subtitle">Feature correlations</h1></div>';
    html += correlation_plot.html;
    html += '</div>';

    html += '</div>';

    // -------------------------------------------------------------------------
    // Prepare results
    // -------------------------------------------------------------------------
    results.graphs.push(roc_curve);
    //results.graphs.push(time_plot);
    for(i = 0; i < correlation_plot.graphs.length; i++){
        results.graphs.push(correlation_plot.graphs[i])
    }
    for(i = 0; i < metrics_table.graphs.length; i++){
        results.graphs.push(metrics_table.graphs[i])
    }

    results.datatables.push(metrics_table.datatables);
    results.datatables.push(features_table.datatables);

    results.html = html;

    return results;
};

modelanalyzer.step_process_custom = function(item,step_id) {
    let step = item.steps[step_id];
    if (this.general_summary && step_id == '00'){
        let contents = this.__global_boxes_prepare_contents(item.data);
        step.graphs = contents.graphs;
        step.datatables = contents.datatables;
        let custom_class = 'modelanalyzer_general_summary';
        step.html='<div class="step '+custom_class+'">'+contents.html+'</div>';  
        step.status = 'processed';
        return step;
    }
    return null;
};