var modeloptimizer = new GRMlab();
modeloptimizer.module_name='modeloptimizer';
modeloptimizer.general_summary = true;

modeloptimizer.color_custom = { 
    axisLabelColor: '#8999b9',
    axisLineColor: '#8999b9',
    inactive_color: '#57698c',
    color_background_1: '#0a213c',
    color_sidebar_letter: '#999999',
    color_sidebar_value: '#dddddd',
    color_optimal_values: color.green_light,
    color_optimal_values_diff: color.orange_light,

    missings: '#e65068',
    specials: '#ea9234',
    informed: '#49a5e6',
};
modeloptimizer.assign_field_renderer_custom = function(field_name,scope,data_type) {
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
        case 'iter':
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
        case 'np0':
        case 'np1':
        case 'np2':
        case 'np3':
        case 'np4':
        case 'np5':
        case 'np6':
        case 'np7':
            renderer= new field_renderer({
                type:'num',
                data_type:data_type,
                cell_align:'center',
                value_format:fmt_dec_max2,
            });
            break;
        case 'score':
            renderer= new field_renderer({
                type:'bar',
                data_type:'table',
                container_css:'padding-left:15px;',
                cell_align:'right',
                value_position:'top',
                value_align:'left',
                value_max: 1,
                value_css_class:'f10',
                value_format:fmt_pct_2_2,
                //value_color_map:,                         
                bar_width:'70px',
                bar_color_map:
                    new color_mapper({
                        type : 'numeric',
                        data_list : [0.9, 0.97, 1],
                        color_list : ['red_1', 'orange_1', 'blue_1']
                    })
            });
            break;
    }
    if (renderer.name=='') return null;
    else return renderer;
}
modeloptimizer.__tooltip_position = function(point, params, dom, rect, size, align){

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
modeloptimizer.__global_left_sidebar_01 = function (tables_data, big_elements = 999, table_elements = 999) {
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
modeloptimizer.__global_left_sidebar_02 = function (tables_data, num_elements = 999, table_elements = 999) {
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
modeloptimizer.__left_sidebar_output = function (tables_data, parameters) {

    
    let idx_name = parameters["index"].indexOf("name");
    let hyperparameters = parameters.data.map(function(vec){
        return vec[idx_name]
    })

    let html = "";

    html+='<div class="block_table">';
    html+='<table>';
    for (i = 0; i<tables_data["data"].length; i++){
        html += '<tr><td>'+tables_data["index"][i]+'</td>';
        if (hyperparameters.includes(tables_data["index"][i])){
            html += '<td class="value" style="color:'+this.color_custom.color_optimal_values+' !important;">';
        }
        else{
            html += '<td class="value">';
        }
        
        value = tables_data["data"][i];
        if (typeof value == "number"){
            html += fmt_dec_max3.format(value)
        }
        else{
            html += (value=="nan"||value==null)? "None":value;
        }
        html += '</td></tr>';
    }
    html+='</table>';

    return html;
};
modeloptimizer.__left_sidebar_scorer = function (tables_data, num_elements = 999, table_elements = 999) {

    params_data = tables_data["characteristics"]
    scorer_data = tables_data["scorer"]

    let html = "";
    html += '<div class="block_table">';
    html += '<table>';

    for (i = 0; i<params_data["data"].length; i++){
        html += '<tr><td>' + params_data["index"][i] + '</td>';
        html += '<td class="value">' + params_data["data"][i] + '</td></tr>';
    }

    html += '<tr><td colspan="2">scorer weights:</td></tr>';

    html += '<tr><td colspan="2"> <div class="block_table"><table>';
    for (i = 0; i<scorer_data["data"].length; i++){
        html += '<tr><td>' + scorer_data["index"][i] + '</td>';
        html += '<td class="value">' + fmt_pct.format(scorer_data["data"][i]) + '</td></tr>';
    }
    html += '</table></div></td></tr>';
    
    html += '</table>';
    html += '</div>';
    return html;
};
modeloptimizer.__left_sidebar_params = function (tables_data) {

    let feature_selection_hyp = [];
    let estimator_hyp = [];

    let idx_name = tables_data["index"].indexOf("name");
    let idx_optimal = tables_data["index"].indexOf("optimal");
    let idx_class = tables_data["index"].indexOf("class");

    let html_feat = "";
    let html_esti = "";
    
	for (i = 0; i<tables_data["data"].length; i++){
        if (tables_data["data"][i][idx_class] == "estimator"){
            html_esti += '<tr><td>'+tables_data["data"][i][idx_name]+'</td>';
            html_esti += '<td class="value" style="color:'+this.color_custom.color_optimal_values+' !important;">';
            value = tables_data["data"][i][idx_optimal];
            if (typeof value == "number"){
                html_esti += fmt_dec_max3.format(value)
            }
            else{
                html_esti += (value=="nan"||value==null)? "None":value;
            }
            html_esti += '</td></tr>';
        }
        else if (tables_data["data"][i][idx_class] == "feature_selection"){
            html_feat += '<tr><td>'+tables_data["data"][i][idx_name]+'</td>';
            html_feat += '<td class="value" style="color:'+this.color_custom.color_optimal_values+' !important;">';
            value = tables_data["data"][i][idx_optimal];
            if (typeof value == "number"){
                html_feat += fmt_dec_max3.format(value)
            }
            else{
                html_feat += (value=="nan"||value==null)? "None":value;
            }
            html_feat += '</td></tr>';
        }
	}

    let html = "";
    html += '<div><h1 class="subsubtitle">Feature selection:</h1></div>';
    html+='<div class="block_table">';
    html+='<table>';
    html+=html_feat;
	html+='</table>';
	html+='</div>';

    html += '<div><h1 class="subsubtitle">Estimator:</h1></div>';
    html+='<div class="block_table">';
    html+='<table>';
    html+=html_esti;
    html+='</table>';
    html+='</div>';
	return html;
};
modeloptimizer.__iters_info_table = function(iters_info, params_info){
    idx_score = iters_info["index"].indexOf("score_mean");
    idx_feats = iters_info["index"].indexOf("features");
    idx_coefs = iters_info["index"].indexOf("coefs");

    idx_params_name = params_info["index"].indexOf("name");
    idx_params_iters = params_info["index"].indexOf("iters");
    idx_params_optimal = params_info["index"].indexOf("optimal");
    idx_class = params_info["index"].indexOf("class");
    //sort scores
    scores_sorted = iters_info["data"].map(function(value,i){
        return [i, value[idx_score]];
    }).sort(function(a,b){return b[1]-a[1]});

    score_optimal = scores_sorted[0][1]

    // HTML
    let html = '';
    html += '<div class="scroll">'
    for (let i = 0; i < iters_info["data"].length; i++) {
        i_order = scores_sorted[i][0];
        html += '<details>';
        html += '<summary style="margin-bottom: 0px;">'
        html += '<h1>Iter ' + (i_order) + ': (Score ' + fmt_dec_max3.format(iters_info["data"][i_order][idx_score]) + ')</h1></summary>';
        
        //html += '<div><h1 class="subtitle">Score: ' + Math.round(iters_info["data"][i_order][idx_score]*100000)/100000 + '</h1></div>';
        score_val = iters_info["data"][i_order][idx_score];
        html += '<div class="block_table"><table>'
        html += '<tr><td>Score</td>'
        html += '<td class="value">' + Math.round(score_val*100000)/100000 + '</td>';
        html += '<td class="value" style="color:'+this.color_custom.color_optimal_values_diff +' !important;">';
        html += Math.round((score_val-score_optimal)*100000)/100000 + '</td></tr>';
        html += '</table></div>'

        html += '<div><h1 class="subtitle">Parameters value:</h1></div>';
        let html_feat = "";
        let html_esti = "";
        
        for (l = 0; l < params_info["data"].length; l++){
            if (params_info["data"][l][idx_class] == "estimator"){
                html_esti += '<tr><td>' + params_info["data"][l][idx_params_name]+'</td>';
                value = params_info["data"][l][idx_params_iters][i_order];
                value_opt = params_info["data"][l][idx_params_optimal];
                if (value == value_opt){
                    html_esti += '<td class="value" style="color:'+this.color_custom.color_optimal_values+' !important;">';
                    class_diff = '<td class="value">';
                }
                else {
                    html_esti += '<td class="value">';
                    class_diff = '<td class="value" style="color:'+this.color_custom.color_optimal_values_diff +' !important;">';
                }
                if (typeof value == "number"){
                    html_esti += fmt_dec_max3.format(value)
                    html_esti += '</td>' + class_diff;
                    html_esti += fmt_dec_max3.format(value - value_opt)
                }
                else{
                    html_esti += (value=="nan"||value==null)? "None":value;
                }
                html_esti += '</td></tr>';
            }
            else if (params_info["data"][l][idx_class] == "feature_selection"){
                html_feat += '<tr><td>' + params_info["data"][l][idx_params_name]+'</td>';
                value = params_info["data"][l][idx_params_iters][i_order];
                value_opt = params_info["data"][l][idx_params_optimal];
                if (value == value_opt){
                    html_feat += '<td class="value" style="color:'+this.color_custom.color_optimal_values+' !important;">';
                    class_diff = '<td class="value">';
                }
                else {
                    html_feat += '<td class="value">';
                    class_diff = '<td class="value" style="color:'+this.color_custom.color_optimal_values_diff +' !important;">';
                }
                if (typeof value == "number"){
                    html_feat += fmt_dec_max3.format(value)
                    html_feat += '</td>' + class_diff;
                    html_feat += fmt_dec_max3.format(value - value_opt)
                }
                else{
                    html_feat += (value=="nan"||value==null)? "None":value;
                }
                html_feat += '</td></tr>'; // PONER DIFERENCIA CON EL MEJOR
            }
        }

        html += '<div><h1 class="subsubtitle">Feature selection:</h1></div>';
        html+='<div class="block_table">';
        html+='<table>';
        html+=html_feat;
        html+='</table>';
        html+='</div>';

        html += '<div><h1 class="subsubtitle">Estimator:</h1></div>';
        html+='<div class="block_table">';
        html+='<table>';
        html+=html_esti;
        html+='</table>';
        html+='</div>';

        html += '<div><h1 class="subtitle">Features coeficients:</h1></div>';
        html += '<div class="block_table"><table>'

        //sort coefs
        if (iters_info["data"][i_order][idx_coefs] != null){
            sorted_coefs = iters_info["data"][i_order][idx_coefs].map(function(value,k){
                return [k, value];
            }).sort(function(a,b){return Math.abs(b[1])-Math.abs(a[1])});
            for (let j = 0; j < sorted_coefs.length; j++){//data[caso].length; j++) {
                j_order = sorted_coefs[j][0]
                html += '<tr>'
                html += '<td>' + iters_info["data"][i_order][idx_feats][j_order] + '</td>';
                html += '<td  class="value">' + fmt_dec_3.format(iters_info["data"][i_order][idx_coefs][j_order]) + '</td>';
                html += '</tr>'
            }
        } else{
            for (let j = 0; j < iters_info["data"][i][idx_feats].length; j++){//data[caso].length; j++) {
                html += '<tr style="height:20px">'
                html += '<td>' + iters_info["data"][i][idx_feats][j] + '</td>';
                html += '</tr>'
            }
        }
        

        /*for (let j = 0; j < sorted_coefs.length; j++){//data[caso].length; j++) {
            j_order = sorted_coefs[j][0]
            html += '<tr>'
            html += '<td>' + iters_info["data"][i_order][idx_feats][j_order] + '</td>';
            html += '<td  class="value">' + fmt_dec_3.format(iters_info["data"][i_order][idx_coefs][j_order]) + '</td>';
            html += '</tr>'
        }*/

        html += '</table></div>'
        html += '</details>';
    }
    html += '</div>'
    return html;
}
modeloptimizer.__scorer_iter = function(data){

    // Figure colors
    var color_01 = color.aqua;
    var color_02 = color.aqua_dark;
    var color_03 = color.medium_blue_light;
    var color_04 = color.core_blue_light;

    idx_score_mean = data["iters_info"]["index"].indexOf("score_mean")
    idx_score_std = data["iters_info"]["index"].indexOf("score_std")
    data_score_mean = data["iters_info"]["data"].map(function(x){
    	return x[idx_score_mean]
    })
    data_score_std = data["iters_info"]["data"].map(function(x){
    	return x[idx_score_std]
    })

    parameters = data["parameters"]
    idx_name = data["parameters"]["index"].indexOf("name")
    idx_iter = data["parameters"]["index"].indexOf("iters")
    idx_choice = data["parameters"]["index"].indexOf("choice")

    for(i = 0; i < parameters["data"].length; i++){
        if (data["parameters"]["data"][i][idx_choice] != null){
            data["parameters"]["data"][i][idx_choice] = data["parameters"]["data"][i][idx_choice].map(function(x){
                return (x==null)? "None":x})
            data["parameters"]["data"][i][idx_iter] = data["parameters"]["data"][i][idx_iter].map(function(x){
                return (x==null)? "None":x})
        }
    }

    // graph
    var option = {
        
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
                //debugger;
                html += "<div class='tooltip'>";
                html += "<span class='u blue_labels'>Iteration "+params[0]["dataIndex"]+"</span>";
                html += "<p class='blue_labels'>Parameters:</p>";
                html += "<div>";
                html += "<table>";
                for (j = 0; j < (parameters["data"].length); j++){
                    html += "<tr style='vertical-align: top;'>";
                    html += "<td class='blue_labels'>";
                    html += '<span class="i">' + parameters["data"][j][idx_name] + ':</span></td>';
                    html += "<td class='right value'>";
                    if (typeof parameters["data"][j][idx_iter][params[0]["dataIndex"]] == 'number'){
                        html += fmt_dec_max3.format(parameters["data"][j][idx_iter][params[0]["dataIndex"]]);
                    }
                    else{
                        html += parameters["data"][j][idx_iter][params[0]["dataIndex"]];
                    }
                    html += "</td></tr>";
                }
                html += "</table>";
                html += "<p class='blue_labels'>Score:</p>";

                error = (params.filter(function(x){return x.seriesName == "score_mas"})[0].value
                			-params.filter(function(x){return x.seriesName == "score"})[0].value)


                html += "<table>";

                for (i = 0; i < (params.length-1); i++){
                	// deactivate #band series
                	if (params[i].seriesName == 'score'){
	                    html += "<tr style='vertical-align: top;'>";
	                    html += '<td class="element" style="color:' + params[i].color + '">&#x25b0;</td> ';
	                    html += "<td class='blue_labels'>";
	                    html += '<span class="i">' + params[i].seriesName + ':</span></td>';
	                    html += "<td class='right value'>";
	                    html += fmt_dec_3.format(params[i].value) + " &#177 " + fmt_dec_3.format(error);
	                    html += "</td></tr>";
                	}
                }
                html += "</table>";
                html += "</div>";
                html += "</div>";
                return html;
            },
            extraCssText: ec_tooltip,
        },
        grid:{
            left: '15%',
            right: '3%',
            bottom: '10%',
            top: '10%',
            //containLabel: true
        },
        xAxis: [{
            type: 'category',
            name: "iteration",
            splitLine: { 
                show: false
            },
            data: data_score_std.map(function(x, i){return i}),
            //axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
            nameLocation: "middle",
            nameGap: 30,
            show: true,
            //axisTick: {show:false},
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
        }],
        yAxis: [{
        	scale:true,
            type: 'value',
            splitLine: { 
                show: false
            },
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
            name: "score",
            nameLocation: "middle",
            nameRotate: 90,
            nameGap: 45,
        }],
        color: ['#175da4', color_01, '#175da4'],
        series: [{
            name:"score_mas",
            type:'line',
            symbol: 'none',
            data: data_score_std.map(function(x, i){return data_score_mean[i]+x*1.96}),
            lineStyle:{
                color: '#175da4',
                width:1,
                type: 'dotted',
            },
        },
        {
            name:"score",
            type:'line',
            symbol: 'circle',
            data: data_score_mean,
            lineStyle:{
                color: '#49a5e6',
                type: 'solid',
            },
            markPoint : {
                label: {show:false},
                symbolSize: 15,
                itemStyle:{
                    color: color.yellow,
                    opacity: 0.6
                },
                data : [
                    {type : 'max', name: 'optimal Value', symbol: "diamond"},
                ]
            }
        },
        {
            name:"score_menos",
            type:'line',
            symbol: 'none',
            data: data_score_std.map(function(x, i){return data_score_mean[i]-x*1.96}),
            lineStyle:{
                color: '#175da4',
                width:1,
                type: 'dotted',
            },
		},
	    {
	        name:'#band2#',symbol:'none',
	        lineStyle: {width:0},
	        type:'line',
	        hoverAnimation:false,
	        data: data_score_std.map(function(x, i){return data_score_mean[i]-x*1.96}),
	        stack:'band',
	    },
	    {
	        name:'#band1#',symbol:'none',
	        lineStyle: {width:0},
	        type:'line',
	        hoverAnimation:false,
	        data: data_score_std.map(function(x, i){return 2*x*1.96}),
	        stack:'band',
	        areaStyle:{color:'#49a5e616',origin:"start"},
	    }]
    };
    
    // plots
    let chart = this.echarts_prepare_chart(option,{});
    return chart;
};
modeloptimizer.__hyperparams_plot = function(data){

    // Figure colors
    var color_01 = color.aqua;
    var color_02 = color.aqua_dark;
    var color_03 = color.medium_blue_light;
    var color_04 = color.core_blue_light;

    idx_score_mean = data["iters_info"]["index"].indexOf("score_mean")
    idx_score_std = data["iters_info"]["index"].indexOf("score_std")
    data_score_mean = data["iters_info"]["data"].map(function(x){
    	return x[idx_score_mean]
    })

    parameters = data["parameters"]
    idx_name = data["parameters"]["index"].indexOf("name")
    idx_iter = data["parameters"]["index"].indexOf("iters")
    idx_choice = data["parameters"]["index"].indexOf("choice")
    for(i = 0; i < parameters["data"].length; i++){
        if (data["parameters"]["data"][i][idx_choice] != null){
            data["parameters"]["data"][i][idx_choice] = data["parameters"]["data"][i][idx_choice].map(function(x){
                return (x==null)? "None":x})
            data["parameters"]["data"][i][idx_iter] = data["parameters"]["data"][i][idx_iter].map(function(x){
                return (x==null)? "None":x})
        }
    }

    // graph
    var option = {
        
        tooltip: {
            trigger: 'item',
            axisPointer:{
                type: 'none'
            },
            position: function (point, params, dom, rect, size) {
                return this.modelanalyzer.__tooltip_position(point, params, dom, rect, size);
            },
            formatter: function(params){
                let html = "";
                //debugger;
                html += "<div class='tooltip'>";
                html += "<span class='u blue_labels'>Iteration "+params["dataIndex"]+"</span>";
                html += "<p class='blue_labels'>Parameters:</p>";
                html += "<div>";
                html += "<table>";
                for (j = 0; j < (parameters["data"].length); j++){
                    html += "<tr style='vertical-align: top;'>";
                    html += "<td class='blue_labels'>";
                    html += '<span class="i">' + parameters["data"][j][idx_name] + ':</span></td>';
                    html += "<td class='right value'>";
                    if (typeof parameters["data"][j][idx_iter][params["dataIndex"]] == 'number'){
                        html += fmt_dec_max3.format(parameters["data"][j][idx_iter][params["dataIndex"]]);
                    }
                    else{
                        html += parameters["data"][j][idx_iter][params["dataIndex"]];
                    }
                    html += "</td></tr>";
                }
                html += "</table>";
                html += "<p>";

                html += "<table>";
                html += "<tr style='vertical-align: top;'>";
                html += '<td class="element" style="color:' + params.color + '">&#x25b0;</td> ';
                html += "<td class='blue_labels'>";
                html += '<span class="i">Score:</span></td>';
                html += "<td class='right value'>";
                html += fmt_dec_3.format(params.value[1]);
                html += "</td></tr>";
                html += "</table></p>";

                html += "</div>";
                html += "</div>";
                return html;
            },
            extraCssText: ec_tooltip,
        },
        legend:{
        	selectedMode: "single",
        	inactiveColor:'#57698c',
            symbolKeepAspect:true,itemHeight:10,itemWidth:13,
            icon:'path://M20,25 100,25 80,75 0,75z', bottom:'0',itemGap:2,
            textStyle: {
                padding:[0, 4, 0, -3],
                align:'left',
                color: '#8999b9',
                fontSize: 10,
            },
            top: '0%'
        },
        grid:{
            left: '15%',
            right: '7%',
            bottom: '7%',
            top: '10%',
            //containLabel: true
        },
        xAxis: [],
        yAxis: [],
        color: [color_01],
        series: []
    };
    numeric_array = {}
    string_array = {}
    for(i = 0; i < parameters["data"].length; i++){

        if (parameters["data"][i][idx_choice] == null){

        	option.series.push({
        		xAxisIndex: i,
        		yAxisIndex: i,
        		name: parameters["data"][i][idx_name],
                type:'scatter',
                symbol: 'circle',
                data: parameters["data"][i][idx_iter].map(function(x,j){return [x, data_score_mean[j]]}),
                lineStyle:{
                    color: '#49a5e6',
                    type: 'solid',
                },
                markPoint : {
                    silent: true,
                    label: {show:false},
                    symbolSize: 20,
                    itemStyle:{
                        color: color.red,
                        opacity: 0.5
                    },
                    data : [
                        {type : 'max', symbol: "circle"},
                    ]
                }
        	});
        	option.xAxis.push({
        		scale:true,
                type: 'value',
                splitLine: { 
                    show: false
                },
                axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
                nameLocation: "middle",
                nameGap: 30,
                //name: data["parameters"]["data"][i][idx_name],
                position: "bottom",
            });
            option.yAxis.push({
            	scale:true,
                type: 'value',
                splitLine: { 
                    show: false
                },
                axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
                name: "score",
                nameLocation: "middle",
                nameRotate: 90,
                nameGap: 45,
                position: "left",
            });
        }
        else{
            // Convert to numeric
            name = parameters["data"][i][idx_name];
            numeric_array[name] = {};
            string_array[name] = {};
            parameters["data"][i][idx_choice].map(function(x,j){
                numeric_array[name][x] = j;
                string_array[name][j] = x;
            }); 

            option.series.push({
                xAxisIndex: i,
                yAxisIndex: i,
                name: parameters["data"][i][idx_name],
                type:'scatter',
                symbol: 'circle',
                data: parameters["data"][i][idx_iter].map(function(x,j){
                    return [numeric_array[name][x], data_score_mean[j]]}),
                    //return [x, data_score_mean[j]]}),
                lineStyle:{
                    color: '#49a5e6',
                    type: 'solid',
                },
                markPoint : {
                    silent: true,
                    label: {show:false},
                    symbolSize: 20,
                    itemStyle:{
                        color: color.red,
                        opacity: 0.5
                    },
                    data : [
                        {type : 'max', symbol: "circle"},
                    ]
                }
            });
            option.xAxis.push({
                scale:true,
                type: 'category',
                splitLine: { 
                    show: false
                },
                axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
                nameLocation: "middle",
                nameGap: 30,
                data: data["parameters"]["data"][i][idx_choice],
                position: "bottom",
                minInterval : 1,
                axisLabel: {
                    formatter: function(x, val){
                        //debugger;
                        return string_array["class_weight"][parseInt(x)]}
                },
            });
            option.yAxis.push({
                scale:true,
                type: 'value',
                splitLine: { 
                    show: false
                },
                axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
                name: "score",
                nameLocation: "middle",
                nameRotate: 90,
                nameGap: 45,
                position: "left",
            });
        }
    }
    
    // plots
    let chart = this.echarts_prepare_chart(option,{});
    return chart;
};
modeloptimizer.__iters_info_data_table = function(iters_info, params_info, scope){
    // Datatable data
    let idx_score = iters_info["index"].indexOf("score_mean")
    let idx_params_iter = params_info["index"].indexOf("iters")
    let idx_choice = params_info["index"].indexOf("choice")

    let idx_name = params_info["index"].indexOf("name");
    let idx_optimal = params_info["index"].indexOf("optimal");
    let idx_class = params_info["index"].indexOf("class");

    let max_score = Math.max.apply(null,iters_info["data"].map(function(vec){return vec[idx_score]}))
    var datatable_columns = ["Iter", "hidden", "Score"];
    var datatable_data = iters_info["data"].map(function(vec, idx){
        return [idx + ' <span class="icon_link"></span>', "",vec[idx_score]/max_score]
    })
    params_info["data"].map(function(vec, idx){
        if (vec[idx_choice] == null){
            datatable_columns.push("NP" + idx);
        }
        else{
            datatable_columns.push("CP" + idx);
        }
        vec[idx_params_iter].map(function(value, idx_j){
            datatable_data[idx_j].push(value);
        })
    })

    // HTML
    for (let i = 0; i < iters_info["data"].length; i++) {
        let html = '';
        score_val = iters_info["data"][i][idx_score];
        html += '<div><h1 class="modal_title">Score: ' + Math.round(iters_info["data"][i][idx_score]*100000)/100000;
        html += '<i style="font-size:16px; color:'+this.color_custom.color_optimal_values_diff +' !important;"> (';
        html += Math.round((score_val-score_optimal)*100000)/100000 + ')</i></h1></div>';

        html += '<p> </p><h1 class="subtitle">Iter ' + i + '</h1>';
        

        html += '<p> </p><div><h1 class="subtitle">Hyperparameters:</h1></div>';

        let html_feat = "";
        let html_esti = "";
        
        for (l = 0; l < params_info["data"].length; l++){
            if (params_info["data"][l][idx_class] == "estimator"){
                html_esti += '<tr style="height:20px"><td>' + params_info["data"][l][idx_params_name]+'</td>';
                value = params_info["data"][l][idx_params_iters][i];
                value_opt = params_info["data"][l][idx_params_optimal];
                if (value == value_opt){
                    html_esti += '<td class="value" style="color:'+this.color_custom.color_optimal_values+' !important;">';
                    class_diff = '<td class="value">';
                }
                else {
                    html_esti += '<td class="value">';
                    class_diff = '<td class="value" style="color:'+this.color_custom.color_optimal_values_diff +' !important;">';
                }
                if (typeof value == "number"){
                    html_esti += fmt_dec_max3.format(value)
                    html_esti += '</td>' + class_diff;
                    html_esti += fmt_dec_max3.format(value - value_opt)
                }
                else{
                    html_esti += (value=="nan"||value==null)? "None":value;
                }
                html_esti += '</td></tr>';
            }
            else if (params_info["data"][l][idx_class] == "feature_selection"){
                html_feat += '<tr style="height:20px"><td>' + params_info["data"][l][idx_params_name]+'</td>';
                value = params_info["data"][l][idx_params_iters][i];
                value_opt = params_info["data"][l][idx_params_optimal];
                if (value == value_opt){
                    html_feat += '<td class="value" style="color:'+this.color_custom.color_optimal_values+' !important;">';
                    class_diff = '<td class="value">';
                }
                else {
                    html_feat += '<td class="value">';
                    class_diff = '<td class="value" style="color:'+this.color_custom.color_optimal_values_diff +' !important;">';
                }
                if (typeof value == "number"){
                    html_feat += fmt_dec_max3.format(value)
                    html_feat += '</td>' + class_diff;
                    html_feat += fmt_dec_max3.format(value - value_opt)
                }
                else{
                    html_feat += (value=="nan"||value==null)? "None":value;
                }
                html_feat += '</td></tr>'; // PONER DIFERENCIA CON EL MEJOR
            }
        }

        html += '<p> </p><div><h1 class="subsubtitle">Feature selection:</h1></div>';
        html+='<div class="block_table">';
        html+='<table>';
        html+=html_feat;
        html+='</table>';
        html+='</div>';

        html += '<p> </p><div><h1 class="subsubtitle">Estimator:</h1></div>';
        html+='<div class="block_table">';
        html+='<table>';
        html+=html_esti;
        html+='</table>';
        html+='</div>';

        /*html += '<div class="block_table"><table>'

        for (l = 0; l < params_info["data"].length; l++){
            html += '<tr><td>' + params_info["data"][l][idx_params_name]+'</td>';
            value = params_info["data"][l][idx_params_iters][i];
            value_opt = params_info["data"][l][idx_params_optimal];
            if (value == value_opt){
                html += '<td class="value" style="color:'+this.color_custom.color_optimal_values+' !important;">';
                class_diff = '<td class="value">';
            }
            else {
                html += '<td class="value">';
                class_diff = '<td class="value" style="color:'+this.color_custom.color_optimal_values_diff +' !important;">';
            }
            if (typeof value == "number"){
                html += fmt_dec_max3.format(value)
                html += '</td>' + class_diff;
                html += fmt_dec_max3.format(value - value_opt)
            }
            else{
                html += value
            }
            html += '</td></tr>'; // PONER DIFERENCIA CON EL MEJOR
        }

        html += '</table></div>'*/

        html += '<p> </p><div><h1 class="subtitle">Features coeficients:</h1></div>';
        html += '<div class="block_table"><table>'

        //sort coefs
        //sort coefs
        if (iters_info["data"][i_order][idx_coefs] != null){
            sorted_coefs = iters_info["data"][i][idx_coefs].map(function(value,k){
                return [k, value];
            }).sort(function(a,b){return Math.abs(b[1])-Math.abs(a[1])});
            for (let j = 0; j < sorted_coefs.length; j++){//data[caso].length; j++) {
                j_order = sorted_coefs[j][0]
                html += '<tr style="height:20px">'
                html += '<td>' + iters_info["data"][i][idx_feats][j_order] + '</td>';
                html += '<td  class="value">' + fmt_dec_3.format(iters_info["data"][i][idx_coefs][j_order]) + '</td>';
                html += '</tr>'
            }
        } else{
            for (let j = 0; j < iters_info["data"][i][idx_feats].length; j++){//data[caso].length; j++) {
                html += '<tr style="height:20px">'
                html += '<td>' + iters_info["data"][i][idx_feats][j] + '</td>';
                html += '</tr>'
            }
        }
        
        

        /*for (let j = 0; j < sorted_coefs.length; j++){//data[caso].length; j++) {
            j_order = sorted_coefs[j][0]
            html += '<tr style="height:20px">'
            html += '<td>' + iters_info["data"][i][idx_feats][j_order] + '</td>';
            html += '<td  class="value">' + fmt_dec_3.format(iters_info["data"][i][idx_coefs][j_order]) + '</td>';
            html += '</tr>'
        }*/

        html += '</table></div>'
        datatable_data[i][datatable_columns.indexOf("hidden")] = html;
    }

    let datatable = this.datatables_prepare_datatable({
        datatable_class:'grid_datatable',
        columns: datatable_columns,
        data: datatable_data}, 
        scope,
        {datatable_class:'grid_datatable'})

    let names_tooltip = '<div style="width: 4px" class="tooltip icon_info">';
    names_tooltip += '<span class="tooltiptext left">';
    names_tooltip += '<h1 class="subtitle">Hyperparamters shortnames:</h1>';
    names_tooltip += '<p> </p><div class="block_table_confusion"><table>';
    for (l = 0; l < params_info["data"].length; l++){
        names_tooltip += '<tr><td class="left">' + params_info["data"][l][idx_params_name] + '</td>';
        if (params_info["data"][l][idx_choice] == null){
            names_tooltip += '<td class="value">NP' + l + '</td></tr>';
        }
        else{
            names_tooltip += '<td class="value">CP' + l + '</td></tr>';
        }
    }
    names_tooltip += '</table></div>';
    names_tooltip += '</span></div>';

    let html = '';
    html += '<div><h1 class="global_subtitle">Iterations details ' + names_tooltip + '</h1></div>';
    html += '<div class="grid_datatable">';
    html += datatable.html;
    html += '</div>';

    return {html: html, datatables: datatable};
};
modeloptimizer.__global_params_plot = function(data){

    // Figure colors
    var color_01 = color.aqua;
    var color_02 = color.aqua_dark;
    var color_03 = color.medium_blue_light;
    var color_04 = color.core_blue_light;

    // Datatable data
    let iters_info = data["iters_info"];
    let params_info = data["parameters"];

    let idx_score = iters_info["index"].indexOf("score_mean")
    let idx_params_iter = params_info["index"].indexOf("iters")
    let idx_params_name = params_info["index"].indexOf("name")
    let idx_choice = params_info["index"].indexOf("choice")

    let max_score = Math.max.apply(null,iters_info["data"].map(function(vec){return vec[idx_score]}))
    let min_score = Math.min.apply(null,iters_info["data"].map(function(vec){return vec[idx_score]}))
    var datatable_columns = ["Iter", "Score"];
    let parallelAxis = [{
        dim: 0, 
        name: "Score",
        axisLine:{lineStyle: {color: modeloptimizer.color_custom.axisLineColor}},
        min: Math.floor(min_score*100)/100,
        max: Math.ceil(max_score*100)/100
    }];
    let datatable_data = iters_info["data"].map(function(vec, idx){return [vec[idx_score]]})
    params_info["data"].map(function(vec, idx){
        if (vec[idx_choice] == null){
            parallelAxis.push({
                dim: idx+1, 
                name: vec[idx_params_name],
                axisLine:{lineStyle: {color: modeloptimizer.color_custom.axisLineColor}},
            });
            vec[idx_params_iter].map(function(value, idx_j){
                datatable_data[idx_j].push(value);
            })
        }
        else{
            parallelAxis.push({
                dim: idx+1, 
                name: vec[idx_params_name],
                type: "category",
                data: vec[idx_choice].map(function(x){return String(x)}),
                axisLine:{lineStyle: {color: modeloptimizer.color_custom.axisLineColor}},
            });
            vec[idx_params_iter].map(function(value, idx_j){
                datatable_data[idx_j].push(parallelAxis[idx+1].data.indexOf(String(value)));
            })
        }
    })

    // graph
    var option = {
        parallelAxis: parallelAxis,
        visualMap: {
            show: true,
            min: min_score,
            max: max_score,
            calculable: true,
            realtime: false,
            precision: 3,
            dimension: 0,
            itemWidth: 10,
            itemHeight: 240,
            orient: 'horizontal',
            padding: [0,0,10,200],
            textStyle:{color: this.color_custom.axisLineColor},
            inRange: {
                color: [color.red,color.yellow,'#49a5e6'],
                //color: ['#d94e5d','#eac736','#50a3ba'],
                // colorAlpha: [0, 1]
            }
        },
        series:{
            type: 'parallel',
            data: datatable_data
        },
        grid:{
            left: '0%',
            right: '0%',
            bottom: '7%',
            top: '0%',
            //containLabel: true
        }
    };
    
    // plots
    let chart = this.echarts_prepare_chart(option,{});
    return chart;
};


modeloptimizer.__global_boxes_prepare_contents = function(json){
    // -------------------------------------------------------------------------
    // Custom functions
    // -------------------------------------------------------------------------

    // -------------------------------------------------------------------------
    // Initialize
    // -------------------------------------------------------------------------
    let real_json = json["item_steps"][0]["step_contents"][0]["content_blocks"][0]["block_data"]
    let results = {html:'', graphs: [], datatables: [], content_class:''};
    let html = '';
    let scope = {item_type:'modeloptimizer',step_type:'analysis',place_type:'modal'};

    // -------------------------------------------------------------------------
    // Prepare data
    // -------------------------------------------------------------------------
    // Left sidebar
    left_sidebar_input_m_char = this.__global_left_sidebar_02(
    	real_json["data"]["input_model"]["characteristics"], 3);
    left_sidebar_input_m_feat = this.__global_left_sidebar_02(
    	real_json["data"]["input_model"]["feature_selection"]);
    left_sidebar_input_m_esti = this.__global_left_sidebar_02(
    	real_json["data"]["input_model"]["estimator"]);
    left_sidebar_train = this.__global_left_sidebar_01(
    	real_json["data"]["train_input"], 2);
    //
    left_sidebar_optimizer_score = this.__left_sidebar_scorer(
    	real_json["data"]);
    left_sidebar_optimizer_params = this.__left_sidebar_params(
    	real_json["data"]["parameters"]);
    total_value_cpu_optimizer = real_json["data"]["cpu_time"]["data"][
    	real_json["data"]["cpu_time"]["index"].indexOf("total")];
    //
    left_sidebar_input_b_char = this.__global_left_sidebar_02(
    	real_json["data"]["output_model"]["characteristics"], 3);
    left_sidebar_input_b_feat = this.__left_sidebar_output(
    	real_json["data"]["output_model"]["feature_selection"],
        real_json["data"]["parameters"]);
    left_sidebar_input_b_esti = this.__left_sidebar_output(
    	real_json["data"]["output_model"]["estimator"],
        real_json["data"]["parameters"]);

    // Main body
    iters_table_info = this.__iters_info_table(real_json["data"]["iters_info"], real_json["data"]["parameters"])
    scorer_iter_plot = this.__scorer_iter(real_json["data"]);
    //hyperparams_plot = this.__hyperparams_plot(real_json["data"]);
    hyperparams_plot = this.__global_params_plot(real_json["data"]);
    
    iters_datatable = this.__iters_info_data_table(real_json["data"]["iters_info"], real_json["data"]["parameters"], scope)


    // -------------------------------------------------------------------------
    // Sidebar Left
    // -------------------------------------------------------------------------
    html += '<div class="pos_sidebar_left">';

    html += '<div class="element dashed_model plus">';
    html += '<div><h1 class="title">Model input</h1></div>';
    html += '<div><h1 class="subtitle">Main characteristics:</h1></div>';
    html += left_sidebar_input_m_char;
    /*html += '<details>';
    html += '<summary>';
    html += '<div><h1 class="subtitle">Feature selection:</h1></div>';
    html += '</summary>'; 
    html += left_sidebar_input_m_feat;    
    html += '</details>';
    html += '<details>';
    html += '<summary>';
    html += '<div><h1 class="subtitle">Estimator:</h1></div>';
    html += '</summary>'; 
    html += left_sidebar_input_m_esti;
    html += '</details>';*/
    html += '</div>';

    html += '<div class="element dashed input">';  
    html += '<div><h1 class="title">Train Dataset</h1></div>';
    html += left_sidebar_train;
    html += '</div>';

    html += '<div class="element process_step">';          
    html += '<div><h1 class="title">Model Optimizer</h1></div>'; 
    html += '<div><h1 class="subtitle">Parameters:</h1></div>';
    html += left_sidebar_optimizer_score;
    html += '<div><h1 class="subtitle">Hyperparameters:</h1></div>';
    html += left_sidebar_optimizer_params;
    html += '<div class="block">' + '<h1 class="subtitle">' + 'Process time: ';
    html += '<span class="block_title_extra"> ' + total_value_cpu_optimizer.toFixed(2) + 's</span>' + '</h1>';
    html += '</div>';
    html += '</div>';

    html += '<div class="element dashed_model output">';
    html += '<div><h1 class="title">Optimal model</h1></div>';
    html += '<div><h1 class="subtitle">Main characteristics:</h1></div>';
    html += left_sidebar_input_b_char;
    html += '<details>';
    html += '<summary>';
    html += '<div><h1 class="subtitle">Feature selection optimizer:</h1></div>';
    html += '</summary>'; 
    html += left_sidebar_input_b_feat;    
    html += '</details>';
    html += '<details>';
    html += '<summary>';
    html += '<div><h1 class="subtitle">Estimator:</h1></div>';
    html += '</summary>'; 
    html += left_sidebar_input_b_esti;
    html += '</details>';
    html += '</div>';

    html += '</div>';

    // -------------------------------------------------------------------------
    // Main Body
    // -------------------------------------------------------------------------
    html += '<div class="pos_mainbody">';

    html += '<div class="row11">';
    html += '<div><h1 class="global_subtitle">Score evolution</h1></div>';
    html += scorer_iter_plot.html;
    html += '</div>';

    html += '<div class="row21">';
    html += '<div><h1 class="global_subtitle">Hyperparameters</h1></div>';
    html += hyperparams_plot.html;
    html += '</div>';

    html += '<div class="row12">';
    html += iters_datatable.html;
    //html += '<div><h1 class="global_subtitle">Iterations details</h1></div>';
    //html += iters_table_info;
    html += '</div>';

    html += '</div>';

    // -------------------------------------------------------------------------
    // Prepare results
    // -------------------------------------------------------------------------
    results.html = html;

    results.datatables.push(iters_datatable.datatables);

    results.graphs.push(scorer_iter_plot);
    results.graphs.push(hyperparams_plot);

    return results;
};


modeloptimizer.step_process_custom = function(item,step_id) {
    let step = item.steps[step_id];
    if (this.general_summary && step_id == '00'){
        let contents = this.__global_boxes_prepare_contents(item.data);
        step.graphs = contents.graphs;
        step.datatables = contents.datatables;
        let custom_class = 'modeloptimizer_general_summary';
        step.html='<div class="step '+custom_class+'">'+contents.html+'</div>';  
        step.status = 'processed';
        return step;
    }
    return null;
};