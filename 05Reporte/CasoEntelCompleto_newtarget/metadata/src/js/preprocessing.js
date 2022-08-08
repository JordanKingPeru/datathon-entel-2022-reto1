var preprocessing = new GRMlab();
preprocessing.module_name = 'preprocessing';
preprocessing.general_summary = true;

preprocessing.color_custorm = {
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

//---------------------------------------------------------------------------
preprocessing.assign_field_renderer_custom = function(field_name,scope,data_type) {
    let renderer = new Object();
    renderer.name='';
    renderer.class='';
    renderer.format_number = '';
    renderer.color_map = new color_mapper({type:null});

    if (scope.element_type == 'summary' && scope.step_type == 'run') {
        switch (field_name) {
            // case 'name': default;
            // case 'dtype': default;
            case 'block_id':        
                renderer.name='block_number';
                renderer.format_number = fmt_int_2;
                break;
            // case 'recommended_action': default;
            case 'constant':        
            case 'empty':           
            case 'exclude':         
            case 'special':         
            case 'special_constant':
            case 'special_unique':
            case 'nan_unique':
            case 'numeric_conversion':
            case 'binary':
            case 'date':
            case 'id':
            case 'ok':
            case 'duplicate':
                renderer.name='check';
                break;
            // case 'duplicated_of': default;
        }
    }
    else if (scope.element_type == 'summary' && scope.step_type == 'transform') {
        switch (field_name) {
            // case 'name': default;
            // case 'dtype': default;
            // case 'block_id': default;
            // case 'action': default;             
            case 'recommended_action':        
                renderer.name='action_tooltip';
                renderer.importance_level='second';
                renderer.comment_col='status';
                renderer.class = 'b_group_1';
                break;            
            // case 'comment': default;                       
            // case 'status': default;                       
            // case 'user_action': default;   
            // case 'user_comment': default;   
        }
    }

    if (renderer.name=='') return null;
    else return renderer;
}
//---------------------------------------------------------------------------



preprocessing.__tooltip_position = function(point, params, dom, rect, size, align){

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

// -------------------------------------------------------------------------
// Version 02
// -------------------------------------------------------------------------
preprocessing.__global_database_quality_v02 = function(tables_data){

    var vars_values = tables_data["data"];
    var column_names = tables_data["columns"];

    // initialize objetcs
    var data = {};
    var data_tot = {};
    let columns_to_show = ["ok", "numeric_conversion", "special", "empty", "exclude", "constant", "nan_unique", 
        "special_unique","special_constant", "binary", "date", "id"];
    for (let i = 0; i < columns_to_show.length; i++){
        data[columns_to_show[i]] = {object: 0, float: 0, integer: 0};
        data_tot[columns_to_show[i]] = {total: 0};
    };

    // calculate the number of data values per type and total
    var num_data = {object: 0, float: 0, integer: 0, total: 0};
    for (let i = 0; i < vars_values.length; i++) {
        num_data[vars_values[i][column_names.indexOf("dtype")]] += 1;
        num_data["total"] += 1;
    };

    // filter empty, constant, nan/unique, special/unique, id and special (special must be the last to test.)
    var_value = vars_values.filter(function(value){
        let first_check = columns_to_show;//["ok", "special", "empty", "numeric_conversion", "constant", "nan_unique", "special_unique"];
        for (let i = 0; i < first_check.length; i++){
            elt = first_check[i];
            if(value[column_names.indexOf(elt)] == 1){
                data_tot[elt].total += 1;
                data[elt][value[column_names.indexOf("dtype")]] += 1;
                return false;
            }
        }
        return true;
    });
    // no_label type
    //var_value = var_value.filter(function(value){
    //    data_tot["no_label"].total += 1;
    //    data["no_label"][value[column_names.indexOf("dtype")]] += 1;
    //    return false;
    //});

    // colors of each item
    colors = [color.sky_blue, color.red_dark, color.red, color.red_medium, color.red_light, 
        color.red_white, color.red_dark, color.red, color.red_medium, color.red_light, 
        color.red_white, color.red_dark, color.red, color.red_medium, color.red_light, 
        color.red_white, color.red_dark, color.red, color.red_medium, color.red_light, 
        color.red_white, color.red_dark, color.red, color.red_medium, color.red_light, 
        color.red_white];


    // graph
    option = {
        color: colors,
        tooltip: {
            trigger: 'axis',
            axisPointer:{
                type: 'shadow'
            },
            position: function (point, params, dom, rect, size) {
                return this.preprocessing.__tooltip_position(point, params, dom, rect, size);
            },
            formatter: function(params){
                console.log(params);
                let html = "";
                html += "<div class='tooltip'>";
                html += "<span class='u blue_labels'>" + params[0].name + "</span>";
                html += "<span class='blue_labels'>   (" + num_data[params[0].name] + " elements) </span>";
                html += "<p class='blue_labels'>The variables with any label are considered deficient.</p>";
                html += "<div>";
                html += "<table>";
                for (let i = 0; i < params.length; i++) {
                    let item = params[i];
                    let group_name = "'" + columns_to_show[i] + "'";
                    html += "<tr style='vertical-align: top;'>";
                    html += '<td class="element" style="color:' + item.color + '">&#x25b0;</td> ';
                    html += "<td class='blue_labels'>";
                    html += '<span class="i">' + item.seriesName + ':</span></td>';
                    html += "<td class='right value'>";
                    html += fmt_pct_0_2.format(item.value);
                    html += "</td>";
                    html += "<td class='blue_labels' style='text-align: right'>";
                    html += "(" + Math.round(item.value * num_data[item.name]) + ")";
                    html += "</td></tr>";
                };
                html += "</table>";
                html += "</div>";
                html += "</div>";
                return html;
            },
            extraCssText: ec_tooltip,
        },
        legend: {
            itemGap:3,
            inactiveColor: this.color_custorm.inactive_color,
            symbolKeepAspect:true,itemHeight:10,itemWidth:13,
            icon:'rect', top:'15',
            textStyle: {
                padding:[0, 5, 0, -2],
                align:'left',
                color: this.color_custorm.axisLabelColor,
                fontSize: 11,
            },
        },   
        grid: [{
            left: '0%',
            right: '4%',
            bottom: '70%',
            top: '14%',
            containLabel: true
        },{
            left: '20',
            right: '5.5%',
            bottom: '19%',
            top: '42%',
            containLabel: true
        }],
        xAxis: [{
            type: 'value',
            splitLine: { 
                show: false
            },
            axisTick:{
                show: false,
            },
            axisLabel:{
                show: false
            },
            axisLine:{show: false, lineStyle: {color: this.color_custorm.axisLineColor}},
            max : 1,
        },{
            gridIndex: 1,
            type: 'value',
            splitLine: { 
                show: false
            },
            axisTick:{
                show: false,
            },
            axisLabel:{
                show: false
            },
            axisLine:{show: false, lineStyle: {color: this.color_custorm.axisLineColor}},
            max : 1,
        }
        ],
        yAxis: [{
            type: "category",
            data: ["total"],
            splitLine: { 
                show: false
            },
            zlevel:999,
            axisLine:{show:false},
            axisTick:{show:false},
            axisLabel:{padding: [-43, 0, 0, -7],inside:true,show:false, color: this.color_custorm.axisLabelColor, fontWeight: "bolder"}
        },
        {
            name:'by datatype',
            nameLocation: 'end',
            nameGap: 10,
            nameTextStyle: {align: 'left',color: '#02A5A5',width:400,padding: [150, 0, 0, 45], fontWeight: "bolder",},

            gridIndex: 1,
            position: "left",
            type: "category",
            data: ["object", "float", "integer"],
            splitLine: { 
                show: false
            },
            axisLine:{show:false},
            axisTick:{show:false},
            //axisLabel:{show:true, color: this.color_custorm.axisLabelColor}
            zlevel:999,            
            axisLabel:{padding: [-31, 0, 0, -7],inside:true,show:true, color: this.color_custorm.axisLabelColor, fontWeight: "bolder"}
        }],
        series: [],
    };

    keys_data = Object.keys(data);
    for (let j = 0; j < keys_data.length; j++){
        if (data_tot[keys_data[j]].total != 0){
            option.series.push(
                {
                    name: keys_data[j],
                    data: Object.keys(data_tot[keys_data[j]]).map(function(value,index){
                        return data_tot[keys_data[j]][value]/num_data[value];
                    }),
                    type: 'bar',
                    stack: '150',
                    barMaxWidth: '42%',
                }
            );
            option.series.push(
                {
                    yAxisIndex: 1,
                    xAxisIndex: 1,
                    name: keys_data[j],
                    data: Object.keys(data[keys_data[j]]).map(function(value,index){
                        return data[keys_data[j]][value]/num_data[value];
                    }),
                    type: 'bar',
                    stack: '100',
                    barMaxWidth: '24%',
                }
            );
        }
    };

    // plots
    let chart = this.echarts_prepare_chart(option,{});
    return chart;
};
preprocessing.__global_tranformations_v02 = function (tables_data) {

    var vars_values = tables_data["data"];
    var column_names = tables_data["columns"];

    // filter only the variables transformed
    var_value = vars_values.filter(function(value){
        return (value[column_names.indexOf("action")] == "transform")? true:false;
    });

    if (var_value.length == 0) {
        return "<div class='dashed_box'><div>No transformations were applied to any column.</div></div>";
    }

    // Initialization
    var data = {};
    // unique cases
    var_value.map(function(value){
        return value[column_names.indexOf("status")]
    }).filter(function(value, index, self){
        return self.indexOf(value) === index;
    }).map(function(value){
        data[value] = {};
    });
    // unique comments
    for (let i = 0; i < Object.keys(data).length; i++) {
        let caso = Object.keys(data)[i];
        var_value.filter(function(value){
            return value[column_names.indexOf("status")] == caso;
        }).map(function(value){
            return value[column_names.indexOf("comment")]
        }).filter(function(value, index, self){
            return self.indexOf(value) === index;
        }).map(function(value){
            data[caso][value] = 0;
        });
    };

    for (let i = 0; i < var_value.length; i++) {
        let caso = var_value[i][column_names.indexOf("status")];
        let comentario = var_value[i][column_names.indexOf("comment")];
        data[caso][comentario] += 1;
    }

    // HTML
    let html = '';
    html += '<div class="scroll">'
    for (let i = 0; i < Object.keys(data).length; i++) {
        let caso = Object.keys(data)[i]
        let keys_sorted = Object.keys(data[caso]).sort(function(a,b){return data[caso][b]-data[caso][a]})
        html += '<details open>';
        html += '<summary><h1>' + caso + ' (' + keys_sorted.length + ')</h1></summary>';
        html += '<div class="block_table"><table>'
        for (let j = 0; j < keys_sorted.length; j++) {
            let comentario = keys_sorted[j];
            html += '<tr>'
            html += '<td>' + comentario + '</td><td class="value">' + data[caso][comentario] + ' columns</td>';
            html += '</tr>'
        }
        html += '</table></div>'
        html += '</details>'        
    }
    html += '</div>'
    return html;
};
preprocessing.__global_apply_summary_v02 = function(tables_data){

    var vars_values = tables_data["data"];
    var column_names = tables_data["columns"];

    // initialize objetcs
    var data = {};
    let info_to_show = ["keep", "transform", "review", "remove"];
    for (let i = 0; i < info_to_show.length; i++){
        data[info_to_show[i]] = {object: {"num": 0, "cases":{}}, 
            float: {"num": 0, "cases":{}}, integer: {"num": 0, "cases":{}}, 
            total: {"num": 0, "cases":{}}};
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

    var color_all = color.red_dark;

    var color_text_legend = color.red;

    // graph
    option = {
        color: [color.medium_blue, color.orange_dark, color.BP_400, color.red_dark],
        tooltip: {
            trigger: 'axis',
            axisPointer:{
                type: 'shadow'
            },
            position: function (point, params, dom, rect, size) {
                return this.preprocessing.__tooltip_position(point, params, dom, rect, size,"right");
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
        }],
        yAxis: [{
            type: 'category',
            data: ["object", "float", "integer", "total"],
            position: "right",
            axisLabel:{ 
                inside: true, 
                color: this.color_custorm.color_sidebar_value,
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


preprocessing.__gs_sidebar_1_datatypes = function (tables_data) {
    var html = '';
    let counts = this.__table_count_by_column(tables_data["data"],tables_data["columns"],'dtype',sort=true);

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

preprocessing.__gs_sidebar_1_findings = function (tables_data) {
    var html = '';
    var findings = {};

    // create a object
    for(let k = 0; k < tables_data.index.length; k++){
        findings[tables_data.index[k]] = tables_data.data[k];
    }
    // remove ok property
    delete findings['ok'];

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

preprocessing.__gs_sidebar_2_justifications = function (tables_data) {
    var html = '';

    let counts = {};
    let data = tables_data["data"];
    let columns = tables_data["columns"];
    let column_pos=columns.indexOf('user_comment');    
    for (let j = 0; j < data.length; j++){
        counts[data[j][column_pos]]=(counts[data[j][column_pos]] || 0)+1;
    }


//    let counts = this.__table_count_by_column(tables_data["data"],tables_data["columns"],'user_comment',sort=true);

    block_options = 
            {
                data:{
                    labels: counts.labels,
                    values:counts.counts,
                }
            };

    html += '<details>';
    html += '<summary>';
    html += '<div><h1 class="subtitle">User justifications:</h1></div>';
    html += '</summary>';
    html += this.block_render_table(block_options);
    html += '</details>';            
    return html;
};


preprocessing.__gs_sidebar_1_actions = function(tables_data){
    var html = '';
    let counts = this.__table_count_by_column(tables_data["data"],tables_data["columns"],'recommended_action',sort=true);
    block_options = 
            {
                data:{
                    labels: counts.labels,
                    values: counts.counts,
                }
            };
    html+=this.block_render_table_actions(block_options);
    return html;    
}

preprocessing.__gs_mainbody_1_duplicates = function (tables_data) {

    var data = tables_data["data"];
    var column_names = tables_data["columns"];

    let duplicated_pos=column_names.indexOf("duplicate_of");
    let variable_name_pos=column_names.indexOf("name");
    let counts = {};
    let duplicated_variables = {};

    for (let j = 0; j < data.length; j++){
        if (data[j][duplicated_pos] == null) continue;
        counts[data[j][duplicated_pos]]=(counts[data[j][duplicated_pos]] || 0)+1;
        if (counts[data[j][duplicated_pos]] == 1) {
            duplicated_variables[data[j][duplicated_pos]]=[];
            duplicated_variables[data[j][duplicated_pos]].push(data[j][variable_name_pos]);
        }
        else if (counts[data[j][duplicated_pos]] > 1) {
            duplicated_variables[data[j][duplicated_pos]].push(data[j][variable_name_pos]);
        }
    }

    // HTML
    let html = '';
    html += '<div class="scroll">'
    for (let i = 0; i < Object.keys(duplicated_variables).length; i++) {
        let variable_name = Object.keys(duplicated_variables)[i]
        html += '<details>';
        html += '<summary style="margin-bottom: 0px;"><h1>' + variable_name + ' (' + duplicated_variables[variable_name].length + ' duplicated)</h1></summary>';
        html += '<div class="block_table"><table>'
        for (let j = 0; j < duplicated_variables[variable_name].length; j++){//data[caso].length; j++) {
            let duplicated_name = duplicated_variables[variable_name][j];
            html += '<tr>'
            html += '<td>' + duplicated_name + '</td>';
            html += '</tr>'
        }
        html += '</table></div>'
        html += '</details>';
    }
    html += '</div>'
    return html;
};

//--
preprocessing.__global_special_type_variables_v02 = function (tables_data) {

    var vars_values = tables_data["data"];
    var column_names = tables_data["columns"];

    let data = {"id": [], "date": [], "binary": [], "target": []};
    let special_types = Object.keys(data);
    // save the variables
    for(let k = 0; k < special_types.length; k++){
        vars_values.forEach(function(value){
            if (value[column_names.indexOf(special_types[k])] == 1){
                data[special_types[k]].push(value[column_names.indexOf("name")]);
            }
        });
    }

    // HTML
    let html = '';
    html += '<div class="scroll">'
    for (let i = 0; i < Object.keys(data).length; i++) {
        let caso = Object.keys(data)[i]
        html += '<details open>';
        html += '<summary><h1>' + caso + ' (' + data[caso].length + ' columns)</h1></summary>';
        html += '<div class="block_table"><table>'
        for (let j = 0; j < data[caso].length; j++){//data[caso].length; j++) {
            let comentario = data[caso][j];
            html += '<tr>'
            html += '<td>' + comentario + '</td>';
            html += '</tr>'
        }
        html += '</table></div>'
        html += '</details>';
    }
    html += '</div>'
    return html;
};
preprocessing.__global_cpu_time_v02 = function(tables_data){

    var operation_type = ["total"];

    var var_types = tables_data["index"].filter(function(value){return (value == "total")? false: true;});
    var time_spend_by_var_type = tables_data["data"].filter(function(value, idx){
        return (tables_data["index"][idx] == "total")? false: true;});

    option = {
        tooltip: {
            trigger: 'axis',
            axisPointer:{
                type: 'shadow'
            },
            position: function (point, params, dom, rect, size) {
                return this.preprocessing.__tooltip_position(point, params, dom, rect, size);
            },
            formatter: function(params){
                let html = '';
                html += "<div class='tooltip'>";
                html += "<span class='u blue_labels'>Time consumed</span>";
                html += "<div>";
                html += "<table>";
                html += "<tr style='vertical-align: top;'>";
                html += '<td class="element" style="color:' + params[0].color + '">&#x25b0;</td> ';
                html += "<td class='blue_labels'>";
                html += '<span class="i">' + "'" + params[0].name + "'" + ':</span></td>';
                html += "<td class='right value'>";
                html += fmt_dec_max2.format(params[0].value) + "s";
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
            data: ["class.", "duplic.", "blocks."],
            axisLine: {
                show: false,
                lineStyle: {color: this.color_custorm.axisLineColor},
            },
            axisLabel: {color: this.color_custorm.axisLabelColor},
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
                lineStyle: {color: this.color_custorm.axisLineColor}
            },
            axisTick:{
                show: false,
                alignWithLabel: true,
            },
            axisLabel: {show: false, color: this.color_custorm.axisLabelColor},
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

preprocessing.__global_left_sidebar_v02 = function (tables_data, flag_title = true, big_elements = 999, table_elements = 999) {
    let html = "";
    let block_options;
    block_options = 
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

    block_options = 
            {
                params: {
                    table_css_class: 'no_border',
                    table_css_style: 'margin-top:-10px;'
                },
                data:{
                    labels:['date column','target column','target type'],
                    values:['-','-','-']
                }
            };
    html+=this.block_render_table(block_options);
    return html;
};

preprocessing.__global_left_sidebar_output_data_v01 = function (samples_info,variables_info) {
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

preprocessing.__global_left_sidebar_output_data_v02 = function (samples_info,variables_info) {
    let samples_output=samples_info.data[samples_info.index.indexOf('samples')];
    let variables_output=variables_info.data[variables_info.index.indexOf('after preprocessing')];    
    let html = "";
    let block_options = 
            {
                params: {
                    big_elements:2,
                },
                data:{
                    labels:['samples','columns'],
                    values:[samples_output,variables_output]
                }
            };
    html+=this.block_render_big_numbers(block_options);
    return html;    
}
// -------------------------------------------------------------------------
// General
// -------------------------------------------------------------------------

preprocessing.__global_boxes_prepare_contents = function(json){
    // -------------------------------------------------------------------------
    // Custom functions
    // -------------------------------------------------------------------------
    function step_contents_data(obj, value_step_id, value_content_type, value_block_type){
        return obj["item_steps"].filter(function(value){
            return (value["step_id"] == value_step_id)? true: false;
        })[0]["step_contents"].filter(function(value){
            return (value["type"] == value_content_type)? true: false;
        })[0]["content_blocks"].filter(function(value){
            return (value["type"] == value_block_type)? true: false;
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

    let left_sidebar_01, left_sidebar_02,left_sidebar_02a ,left_sidebar_04 , total_value_cpu_0, cpu_time, 
        database_quality, special_types, special_type_variables, 
        total_value_cpu_1, tranformations;
    let left_sidebar_column_analysis;


    let sidebar_1_datatypes, sidebar_1_findings,sidebar_1_actions;
    let sidebar_2_actions;
    //let sidebar_2_justifications;
    let apply_summary_transform;
    let mainbody_1_duplicates;
    // -------------------------------------------------------------------------
    // Prepare data
    // -------------------------------------------------------------------------
    left_sidebar_01 = this.__global_left_sidebar_v02(step_contents_data(json, "01", "stats", "db_info"),false, 2);
    sidebar_1_datatypes = this.__gs_sidebar_1_datatypes(step_contents_data(json, "01", "summary", "table")["block_data"]);
    sidebar_1_findings = this.__gs_sidebar_1_findings(step_contents_data(json, "01", "stats", "column_analysis")["block_data"]);
    sidebar_1_actions = this.__gs_sidebar_1_actions(step_contents_data(json, "01", "summary", "table")["block_data"]);

    total_value_cpu_0 = step_contents_data(json, "01", "stats", "cpu_time")["block_data"];
    total_value_cpu_0 = total_value_cpu_0["data"][total_value_cpu_0["index"].indexOf("total")];
    cpu_time = this.__global_cpu_time_v02(step_contents_data(json, "01", "stats", "cpu_time")["block_data"]);
    database_quality = this.__global_database_quality_v02(step_contents_data(json, "01", "summary", "table")["block_data"]);
    special_type_variables = this.__global_special_type_variables_v02(step_contents_data(json, "01", "summary", "table")["block_data"]);
    if (exists_apply){
        //left_sidebar_03 = this.__global_action_table_v02(step_contents_data(json, "02", "stats", "results"));
        sidebar_2_actions = this.__gs_sidebar_2_actions(step_contents_data(json, "02", "summary", "table")["block_data"]);
        //sidebar_2_justifications = this.__gs_sidebar_2_justifications(step_contents_data(json, "02", "summary", "table")["block_data"]);
        total_value_cpu_1 = step_contents_data(json, "02", "stats", "cpu_time")["block_data"];
        total_value_cpu_1 = total_value_cpu_1["data"][total_value_cpu_1["index"].indexOf("total")];
        apply_summary_transform = this.__global_apply_summary_v02(step_contents_data(json, "02", "summary", "table")["block_data"]);
        tranformations = this.__global_tranformations_v02(step_contents_data(json, "02", "summary", "table")["block_data"]);
        //results.graphs.push(apply_summary_transform);
        left_sidebar_04 = this.__global_left_sidebar_output_data_v02(
        step_contents_block_data(json, "01", "stats", "db_info").block_data,
        step_contents_block_data(json, "02", "stats", "results").block_data);                
    }
    else{
        sidebar_2_actions = "";
        tranformations = "<div class='dashed_box'><div>'transform' step not executed</div></div>";
    };
    mainbody_1_duplicates = this.__gs_mainbody_1_duplicates(step_contents_data(json, "01", "summary", "table")["block_data"]);

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
    html += '<div><h1 class="subtitle">Column datatypes:</h1></div>';
    html += sidebar_1_datatypes; 
    html += '<details>';
    html += '<summary>';
    html += '<div><h1 class="subtitle">Findings:</h1></div>';
    html += '</summary>';
    html += sidebar_1_findings;    
    html += '</details>';
    html += '<div><h1 class="subtitle">Recommended actions:</h1></div>';
    html += sidebar_1_actions;      
    html += '<div class="block">' + '<h1 class="block_subtitle">' + 'Process time: ';
    html += '<span class="block_title_extra">' + total_value_cpu_0.toFixed(2) + 's</span>' +'</h1>';
    html += '</div>';
    html += '</div>';

    if(exists_apply){
        html += '<div class="element process_step">';         
        html += '<div><h1 class="title">2. Transform step</h1></div>';   
        html += '<div><h1 class="subtitle">Applied actions:</h1></div>';
        html += sidebar_2_actions;
        //html += sidebar_2_justifications;            
        //html += left_sidebar_03a;        
        html += '<div class="block">';
        //html += '<h1 class="block_subtitle">' + 'Actions by datatype: ' + '</h1>';
        //html += '<div class="echart_chart"  style="width:calc(100% - 20px);height: 80px;" id="' + apply_summary_transform.html_element_id + '"></div>';
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
    html += '<div><h1 class="global_subtitle">Database quality</h1></div>';
    html += '<div class="echart_chart" id="' + database_quality.html_element_id + '"></div>';
    html += '</div>'
    html += '<div class="row21">';
    switch(version){
        case "01":
            html += '<div><h1 class="global_subtitle">Particular types</h1></div>';//Significant, 
            html += '<div class="echart_chart" id="' + special_types.html_element_id + '"></div>';
            break;
        case "02":
            html += '<div><h1 class="global_subtitle">Columns of special type identified</h1></div>';//Significant, 
            html += '' + special_type_variables + '';
           break;
    }
    html += '</div>';
    html += '<div class="row22">';
    html += '<div class="row221">';    
    html += '<h1 class="global_subtitle">Duplicated columns</h1>';
    html += mainbody_1_duplicates;
    html += '</div>';    

    html += '<div class="row222">';    
    html += '<h1 class="global_subtitle">Applied column transformations</h1>';
    html += tranformations;    
    html += '</div>';

    html += '</div>';
    html += '</div>';

    // -------------------------------------------------------------------------
    // Prepare results
    // -------------------------------------------------------------------------
    // results.graphs.push(cpu_time);
    results.graphs.push(database_quality);
    
    results.html = html;
    // Filter boxes with no graphs
    results.graphs = results.graphs.filter(function(value){return value != ''});

    return results;
};

preprocessing.step_process_custom = function(item,step_id) {
    let step = item.steps[step_id];
    if (this.general_summary && step_id == '00'){
        let contents = this.__global_boxes_prepare_contents(item.data);
        step.graphs = contents.graphs;
        //step.datatables = [];
        let custom_class = 'preprocessing_general_summary';
        step.html='<div class="step '+custom_class+'">'+contents.html+'</div>';  
        step.status = 'processed';
        return step;
    }
    return null;
}