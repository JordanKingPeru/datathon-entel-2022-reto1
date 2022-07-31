var optimalgrouping = new GRMlab();
optimalgrouping.module_name='optimalgrouping';

optimalgrouping.__tooltip_position = function(point, params, dom, rect, size, align){

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

//---------------------------------------------------------------------------
optimalgrouping.assign_field_renderer_custom = function(field_name,scope,data_type) {
    let renderer = new Object();
    renderer.name='';
    renderer.class='';
    renderer.format_number = '';
    renderer.color_map = new color_mapper({type:null});

    switch (field_name) {
        case '#color#': 
            renderer.name='colorbox';
            break;
        case 'non-event count':
            renderer.name='none';
            break;
        case 'splits':
            renderer.name='string';
            renderer.tooltip=true;
            renderer.max_length = 10;
            renderer.class='left';
            renderer.style='padding-left:5px;';
            break;
        case 'records count':
        case 'event count':
            renderer= new field_renderer({
                type:'num',
                data_type:data_type,
                cell_align:'right',
                value_format:fmt_int,
            });
            break;
        case 'default rate':
            renderer= new field_renderer({
                type:'num',
                data_type:data_type,
                cell_align:'right',
                value_format:fmt_pct_2_2,
            });
            break;
        case 'woe':
            renderer.name='woe';
            renderer.format_number = fmt_dec_3;
            renderer.width_factor = 0.54;
            renderer.color_map = new color_mapper({
                type : 'numeric',
                data_list : [null],
                color_list : ['white_9']
            });
            break;
        case 'woe_____dev':
            renderer= new field_renderer({
                type:'twobars',
                data_type:data_type,
                value_position:'right',
                value_align:'right',
                value_format:fmt_dec_3,
                value_min:-1,
                value_max:1,
                value_color_map:'',
                bar_color_map:'',
                bar_width:'35px',
            });
            break;
        case 'iv':
          renderer.name='iv';
          renderer.format_number = fmt_dec_3;
          renderer.width_factor = 4;
          renderer.color_map = new color_mapper({
            type : 'numeric',
            data_list : [null],
            color_list : ['white_9']
          });
          break;
    }
    if (renderer.name=='') return null;
    else return renderer;
}

//---------------------------------------------------------------------------
// modal box
optimalgrouping.modal_boxes_prepare_contents =  function(data){
    console.log(data);
    var results = {html:'',graphs: [],datatables: [],content_class:''};
    results.content_class = 'modal_optbin';
    var html = '';
    var v_data = data.data;

    var binning_table_data = v_data.binning_table.data;
    var binning_table_columns = v_data.binning_table.columns;

    // -------------------------------------------------------------------------
    html +='<div class="c1 tgg">';
    // -------------------------------------------------------------------------
    html +='<div>';
    html +='<h1 class="modal_title">'+v_data.name;
    html +='<span class="italic grey"> ('+v_data.type+')</span>';
    html +='</h1>';
    html +='</div>';
    // -------------------------------------------------------------------------

    var series = [];
    var labels = [];
    var legend_labels = [];
    var serie_event_rate= [];
    var serie_event_rate_miss= [];
    var serie_event= [];
    var color_column= [];

    // Prepare chart data
    // EXclude the last element (grand total)
    for (var i = 0; i < binning_table_data.length-1; i++) {
        var event_rate_el= {};
        var event_rate_miss_el= {};
        var event_el= {};
        var label_el= {};
        switch (binning_table_data[i][0]) {
            case 'Missing':
                event_rate_miss_el={
                        value:binning_table_data[i][4],
                        symbol:'circle',symbolSize:6,
                        itemStyle:{color:'#ea9234',borderWidth:1,borderColor:color_background_1+'22'}}
                event_rate_el={value:null}
                event_el={value:binning_table_data[i][3],itemStyle:{color:'#06a29f'}}
                label_el={value:'Missing',itemStyle:{textColor:red_1}}
                color_column.push('#06a29f');
                break;
            case 'Special':
                event_rate_miss_el={
                        value:binning_table_data[i][4],
                        symbol:'circle',symbolSize:6,
                        itemStyle:{color:'#ea9234',borderWidth:1,borderColor:color_background_1+'22'}}
                event_rate_el={value:null}
                event_el={value:binning_table_data[i][3],itemStyle:{color:'#9e50de'}}
                label_el={value:'Special',itemStyle:{color:blue_1}}
                color_column.push('#9e50de');
                break;
            default:
                event_rate_miss_el={value:null}
                event_rate_el={
                        value:binning_table_data[i][4],
                        symbol:'circle',symbolSize:5,
                        itemStyle:{color:'#ea9234',borderWidth:1,borderColor:color_background_1+'11'}}
                if (binning_table_data[i+1][0] == 'Special' & v_data.group_others == 1) {
                    label_el={value:(i+1)+'.'+binning_table_data[i][0],itemStyle:{color:blue_0}}
                    event_el={value:binning_table_data[i][3],itemStyle:{color:blue_0}}
                    color_column.push(blue_0);
                }
                else {
                    label_el={value:(i+1)+'.'+binning_table_data[i][0],itemStyle:{color:blue_1}}
                    event_el={value:binning_table_data[i][3],itemStyle:{color:blue_1}}
                    color_column.push(blue_1);
                }
        }
        serie_event_rate_miss.push(event_rate_miss_el);
        serie_event_rate.push(event_rate_el);
        serie_event.push(event_el);
        labels.push(label_el);
    }
    let global_event_rate=binning_table_data[binning_table_data.length-1][4];

    console.log(labels);

    series.push({
                name:'Event rate',type:'line',yAxisIndex:1,
                itemStyle:{color:'#ea9234'},lineStyle:{color:'#ea9234',width:0},
                data:serie_event_rate_miss,
                hoverAnimation:false
                });
    series.push({
                name:'Event rate',type:'line',yAxisIndex:1,
                itemStyle:{color:'#ea9234'},lineStyle:{color:'#ea9234',width:1.4},
                data:serie_event_rate,
                hoverAnimation:false,
                amarkLine: {
                    silent:false,animation:false,
                    label: {fontSize: 10,position:'start'},
                    lineStyle: {color:'#e65068',type:'dotted'},
                    xindexValue: 0,
                    data: [
                        [
                            {
                                qname: fmt_pct_1_1.format(global_event_rate),symbol:'arrow',
                                xAxis: 0,yAxis: global_event_rate,
                                lineStyle:{color:'rgba(234, 146, 52, 0.74)',width:1.4,type:'dotted'},
                                label: {atextBorderWidth:4,atextBorderColor: color_background_1,fontSize: 11,position:'end',alineHeight: 20,padding: [0,0,12, -40],},
                            },
                            {symbol:'none',x: '100%',yAxis:global_event_rate}
                        ],
                        /*
                        [
                            {
                                name: '> '+fmt_num(outliers_high_threshold),symbol:'none',
                                xAxis: serie_label.length-2,yAxis: 'min'
                            },
                            {symbol:'none',xAxis: serie_label.length-2,y: '2%'}
                        ],
                        [
                            {
                                label: {textBorderWidth:4,textBorderColor: color_background_1,fontSize: 11,position:'middle',lineHeight: 20,padding: [0,0,-7, 0],},
                                lineStyle: {opacity:0},
                                name: 'outliers',symbol:'none',
                                xAxis: 1,
                                yAxis: 'min'
                            },
                            {symbol:'none',xAxis: 1,y: '2%'}
                        ],
                        [
                            {
                                label: {textBorderWidth:4,textBorderColor: color_background_1,fontSize: 11,position:'middle',lineHeight: 20,padding: [0,0,-13, 0],},
                                lineStyle: {opacity:0},
                                name: 'outliers',symbol:'none',
                                xAxis: serie_label.length-2,
                                yAxis: 'min'
                            },
                            {symbol:'none',xAxis: serie_label.length-2,y: '2%'}
                        ],
                        */
                    ]
                },
                });
    series.push({
                name:'Events',type:'bar',
                itemStyle:{color:'#49a5e6'},
                data:serie_event,barMaxWidth: 40,yAxisIndex:0,
                });

    legend_labels.push({name:'Event rate',icon:'circle',atextStyle:{color:'#67799c'}});
    legend_labels.push({name:'Event rate',icon:'circle',atextStyle:{color:'#67799c'}});
    legend_labels.push({name:'Events',icson:'rect',atextStyle:{color:'#67799c'}});


    let xAxis_Name ='';
    switch (v_data.type) {
        case 'numerical': xAxis_Name='Interval'; break;
        case 'categorical': xAxis_Name='Values'; break;
        case 'nominal': xAxis_Name='Values'; break;
        case 'ordinal': xAxis_Name='Interval'; break;
    }

    // Create chart;
    let graph = new Object();
    graph.html_element_id='chart_'+Math.random().toString(36).substr(2, 12);
    graph.options = {
        tooltip: {
            position: function (point, params, dom, rect, size) {
                return this.optimalgrouping.__tooltip_position(point, params, dom, rect, size);
            },
            trigger: 'axis',
            formatter: function(params){
                let html = '';
                console.log(params);
                html += "<div class='tooltip'>";
                let xAxis_Name =params[0].axisId;
                // Force "tooltip xAxis label" for Missing and Special groups
                if (params[0].axisValueLabel == 'Missing' || params[0].axisValueLabel == 'Special'){
                    html += "<span class='blue_labels'>Values:</span>";
                    html += "<span class='f12'>&nbsp;"+params[0].name+"</span>";
                }
                else {
                    html += "<span class='blue_labels'>"+xAxis_Name+":</span>";
                    // Remove the index number
                    var group_name = params[0].name.substr(1+params[0].name.indexOf('.'));
                    html += "<span class='f12'>&nbsp;"+group_name+"</span>";
                }
                html += "<div>";
                html += "<table>";
                for (let item of params) {
                    if (item.value == null) continue;
                    let group_name = ""+item.seriesName+"";
                    if (item.seriesName == 'Others') group_name = 'Others';

                    html+="<tr style='vertical-align: top;'>";
                    let icon ='';
                    if (item.seriesType == 'line') icon = '&bull;';
                    else icon = '&#x25b0';
                    html+='<td class="element" style="color:'+item.color+'">'+icon+'</td> ';
                    html+="<td class='blue_labels'>";
                    html+='<span class="i">'+group_name+':</span></td>';
                    html+="<td class='right value'>";
                    //console.log(item.value);
                    //if (typeof item.value == "undefined") html+= '-';
                    //else html+=fmt_dec_max1.format(item.value*100)+"%";
                    if (item.seriesType == 'line') html+=fmt_dec_max1.format(item.value*100)+"%";
                    else html+=fmt_dec_max1.format(item.value)+"";
                    html+="</td></tr>";
                }
                html += "</table>";
                html += "</div>";
                return html;
            },
            extraCssText: ec_tooltip,
        },
        legend: {
            xxxtooltip: {
                triggers: 'item',
                show:true,
                formatter: function(params){
                    if (params.name.length <= 7) return;
                    let html = '';
                    html += "<div class='tooltip_2'>";
                    html += "<div class='f10 i'>'"+params.name+"'</div>";
                    html += "<div>";
                    return html;
                },
            },
            symbolKeepAspect:false,itemHeight:6,itemWidth:12,
            inactiveColor:'#57698c',
            textStyle: {
                padding:[0, 4, 0, -3],
                align:'left',
                color: '#8999b9',
                fontSize: 10
            },
            icon:'path://M20,20 100,20 80,80 0,80z', bottom:'0',itemGap:2,
            data:legend_labels,
            xxxformatter: function(x){
                if (x == 'Others') return x;
                else {
                    if (x.length>7) return ""+x.substring(0,5)+"...";
                    else return "'"+x+"'";
                }
            }//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        },
        grid: {left:  '40',right: '40',bottom:'37',top:   '10',},
        xAxis: {
            type: 'category',
            axisPointer:{
                type:'shadow',z:0,
                shadowStyle:{color:'rgba(150,150,150,0.1)'},
            },
            axisLabel: {
                // Backlog: Add tooltip (not currently supported by eCharts)
                arotate:45,show:true,color:'#8999b9',fontSize: 10,
                interval:0,
                formatter: function(x){
                    if (x == 'Special') return 'S';
                    if (x == 'Missing') return 'M';
                    // only the index
                    else return x.split('.')[0];
                }
            },
            axisLine: {
                symbol: ['none', 'none'],
                symbolOffset:[0, 8],
                symbolSize:[6, 10],
                lineStyle: {color:'#8999b9'}
            },
            bsoundaryGap: false,
            data: labels,
            id: xAxis_Name
        },
        yAxis: [{
                splitLine: {show: true,lineStyle: {color: '#45567899'}},
                axisLabel: {interval: 0,color:'#8999b9',fontSize: 10},
                axisLine: {show:true,lineStyle: {color:'#8999b9'}},
                type: 'value',scale:true,
            },
            {
                splitLine: {show: false,lineStyle: {etype:'dotted',color: '#ea923466'}},
                axisTick: {show: true,lineStyle: {color: '#ea9234'}},
                axisLabel: {
                    interval: 0,color:'#ea9234',fontSize: 10,
                    formatter: function(x){return fmt_dec_max1.format(x*100)+'%';}
                },
                axisLine: {show:true,lineStyle: {color:'#ea9234'}},
                type: 'value',scale:true,
            },
        ],
        color:[
            '#175da4','#49a5e6','#2dcccd','#d8be75','#f35e61','#61d178','#ac6f2e','#dfff54','#ff53a5','#006568'
        ],
        animationDuration: 300,
        series: series,
    }
    results.graphs.push(graph);


    // Chart
    html +='<div class="echart_chart" id="'+graph.html_element_id+'"></div>';

    // Datatable data
    // Discard last item (grand total)
    var datatable_data=data.data.binning_table.data.slice(0, -1);
    console.log(datatable_data);
    var datatable_columns=data.data.binning_table.columns.slice(0);
    var scope = {
                    item_type:'optimalgrouping',
                    step_type:'analysis',
                    place_type:'modal'
        };

    // Todo: Change. Aditional color_column
    var splits_pos=datatable_columns.indexOf("Splits");
    for (var i = 0; i < datatable_data.length; i++) {
        datatable_data[i]=datatable_data[i].slice(0);
        datatable_data[i].unshift(color_column[i]);
    }
    datatable_columns.unshift('#color#');

    //let datatable = view_datatable(datatable_columns,datatable_data,scope);
    let datatable = this.datatables_prepare_datatable({columns:datatable_columns,data:datatable_data},scope)

    results.datatables.push(datatable);
    html +='<div class="optbin_datatable">';
    html +=datatable.html;
    html +='</div>';

    // -------------------------------------------------------------------------
    html +='</div>';
    // -------------------------------------------------------------------------

    // -------------------------------------------------------------------------
    html +='<div class="c2 t scrollable">';
    // -------------------------------------------------------------------------

    // Binning Options block
    let title = '';
    let items = [];

class value_renderer {
    constructor(params) {
        //num
        this.type = params.type;

        if (this.type == 'num(num)') {
            this.formats = [fmt_int,fmt_int];
            this.set_formats = function(formats) {
                this.formats = formats;
            }
            this.render = function(data) {
                let result = '';
                let v1 = isNaN(data[0]) ? '-' : this.formats[0].format(data[0]);
                let v2 = isNaN(data[1]) ? '-' : this.formats[1].format(data[1]);
                result += v1 + ' (' + v2 + ')';
                return result;
            }
        }

    }
}
    let renderer_1 = new value_renderer({type:'num(num)'});


    html +='<div>';

// TODO move out
// Prepare HTML for options blocks in modal boxes
function modal_option_subblock(title, items) {
    let html ='';
    html +='<div class="options_subblock">';
    html +='<div class="subtitle">'+title+'</div>';
    html +='<div class="options">';
    for (var i = 0; i < items.length; i++) {
        html +='<div class="option">';
        html +='<div class="label">'+items[i].label+'</div>';
        html +='<div class="value">' + items[i].value +'</div>';
        html +='</div>';
    }
    html +='</div>';
    html +='</div>';
    return html;
}

    // First block
    // -------------------------------------------------------------------------
    html +='<div class="options_block two_cols">';
    html +='<div>'; // First block - First column

    items = [];
    title = 'Main options';
    items.push({label:'prebinning',value:v_data.prebinning});
    items.push({label:'prebinning_max_nodes',value:v_data.prebinning_max_nodes});
    items.push({label:'monotonicity_sense',value:v_data.monotonicity_sense});
    items.push({label:'min_buckets',value:v_data.min_buckets});
    items.push({label:'max_buckets',value:v_data.max_buckets});
    items.push({label:'min_bucket_size',value:fmt_dec_3.format(v_data.min_bucket_size)});
    items.push({label:'max_bucket_size',value:fmt_dec_3.format(v_data.max_bucket_size)});
    items.push({label:'min_pd_difference',value:fmt_dec_3.format(v_data.min_pd_difference)});
    items.push({label:'regularization',value:v_data.regularization});
    items.push({label:'reduce_bucket_size_diff',value:v_data.reduce_bucket_size_diff});
    html +=modal_option_subblock(title,items);

    items = [];
    title = 'Pre-binning algorithmic options';
    items.push({label:'algorithm',value:v_data.algorithm});
    items.push({label:'ctree options',value:''});
    items.push({label:'  variable_type',value:v_data.variable_type});
    items.push({label:'  min_criterion',value:v_data.min_criterion});
    items.push({label:'  max_candidates',value:v_data.max_candidates});
    items.push({label:'  DSM',value:v_data.dynamic_split_method});
    html +=modal_option_subblock(title,items);

    html +='</div>';
    html +='<div>'; // First block - Second column

    items = [];
    title = 'Extra options';
    items.push({label:'special_values',value:v_data.special_values});
    items.push({label:'special_handler_policy',value:v_data.special_handler_policty});
    items.push({label:'special_woe_policy',value:v_data.special_woe_policy});
    items.push({label:'missing_woe_policy',value:v_data.missing_woe_policy});
    html +=modal_option_subblock(title,items);

    items = [];
    title = 'User pre-binning options';
    items.push({label:'pre-buckets',value:v_data['pre-buckets']});
    items.push({label:'indexes_forced',value:v_data.indexes_forced});
    html +=modal_option_subblock(title,items);

    html +='</div>';
    html +='</div>';

    // Second block
    // -------------------------------------------------------------------------
    html +='<div class="options_block two_cols">';
    html +='<div>'; // Second block - First column

    renderer_1.set_formats([fmt_int,fmt_int]);
    items = [];
    title = 'Problem statistics';
    let o_variables = v_data.original_variables;
    let o_constraints = v_data.original_constraints;
    let o_nonzeros = v_data.original_nonzeros;
    let a_variables = [v_data.after_variables,v_data.after_variables-o_variables];
    let a_constraints = [v_data.after_constraints,v_data.after_constraints-o_constraints];
    let a_nonzeros = [v_data.after_nonzeros,v_data.after_nonzeros-o_nonzeros];
    items.push({label:'original problem',value:''});
    items.push({label:'  original_variables',value:o_variables});
    items.push({label:'  original_constraints',value:o_constraints});
    items.push({label:'  original_nonzeros',value:o_nonzeros});
    items.push({label:'after preprocessing',value:''});
    items.push({label:'  after_variables',value:renderer_1.render(a_variables)});
    items.push({label:'  after_constraints',value:renderer_1.render(a_constraints)});
    items.push({label:'  after_nonzeros',value:renderer_1.render(a_nonzeros)});
    html +=modal_option_subblock(title,items);

    renderer_1.set_formats([fmt_dec_3,fmt_pct]);
    items = [];
    title = 'Timing statistics';
    let t_total = v_data.time_total;
    let t_prebinning = [v_data.time_prebinning,v_data.time_prebinning/t_total];
    let t_model_data = [v_data.time_model_data,v_data.time_model_data/t_total];
    let t_model_generation = [v_data.time_model_generation,v_data.time_model_generation/t_total];
    let t_optimizer = [v_data.time_optimizer,v_data.time_optimizer/t_total];
    let t_prep = [v_data.time_preprocessing,v_data.time_preprocessing/v_data.time_optimizer];
    let post_analysis = [v_data.post_analysis,v_data.post_analysis/t_total];
    items.push({label:'time_total',value:fmt_dec_3.format(t_total)});
    items.push({label:'  prebinning',value:renderer_1.render(t_prebinning)});
    items.push({label:'  model_data',value:renderer_1.render(t_model_data)});
    items.push({label:'  model_generation',value:renderer_1.render(t_model_generation)});
    items.push({label:'  optimizer',value:renderer_1.render(t_optimizer)});
    items.push({label:'    preprocessing',value:renderer_1.render(t_prep)});
    items.push({label:'  post_analysis',value:renderer_1.render(post_analysis)});
    html +=modal_option_subblock(title,items);

    html +='</div>';
    html +='<div>'; // Second block - Second column

    renderer_1.set_formats([fmt_int,fmt_pct]);
    items = [];
    title = 'Optimizer statistics';
    let status = v_data.status;
    let objective = v_data.objective;
    let i_buckets = [v_data.infeasible_buckets,v_data.infeasible_buckets_perc];
    let cuts_generated = v_data.cuts_generated;
    let cuts_used = [v_data.cuts_used,v_data.cuts_used/cuts_generated];
    let branch_and_cut_nodes = v_data.branch_and_cut_nodes;
    items.push({label:'status',value:status});
    items.push({label:'objective',value:fmt_dec_5.format(objective)});
    items.push({label:'preprocessor',value:''});
    items.push({label:'  infeasible_buckets',value:renderer_1.render(i_buckets)});
    items.push({label:'cutting planes',value:''});
    items.push({label:'  cuts_generated',value:cuts_generated});
    items.push({label:'  cuts_used',value:renderer_1.render(cuts_used)});
    items.push({label:'branch_and_cut_nodes',value:branch_and_cut_nodes});
    html +=modal_option_subblock(title,items);

    items = [];
    title = 'Optimizer options';
    items.push({label:'root_LP_algorithm',value:v_data.root_LP_algorithm});
    items.push({label:'time_limit',value:v_data.time_limit});
    items.push({label:'MIP_gap',value:v_data.MIP_gap});
    html +=modal_option_subblock(title,items);

    html +='</div>';
    html +='</div>';

    // Third block
    // -------------------------------------------------------------------------
    html +='<div class="options_block two_cols">';
    html +='<div>'; // Third block - First column

    items = [];
    title = 'Prebinning statistics';
    items.push({label:'buckets',value:v_data.prebinning_buckets});
    items.push({label:'IV',value:fmt_dec_5.format(v_data.prebinning_iv)});
    items.push({label:'trend_changes',value:v_data.prebinning_trend_changes});
    html +=modal_option_subblock(title,items);

    html +='</div>';
    html +='<div>'; // Third block - Second column

    items = [];
    title = 'Optimal-binning statistics';
    let o_buckets = [v_data.optimal_buckets,v_data.optimal_buckets-v_data.prebinning_buckets];
    let o_iv = [v_data.optimal_iv,v_data.optimal_iv-v_data.prebinning_iv];
    let o_monotonicity_sense = v_data.optimal_monotonicity_sense;
    let pvalue = v_data.pvalue;
    let pvalue_method = v_data.pvalue_method;
    let largest_bucket = [v_data.largest_bucket,v_data.largest_bucket_perc];
    let smallest_bucket = [v_data.smallest_bucket,v_data.smallest_bucket_perc];
    let std_bucket_size = v_data.std_bucket_size;

    renderer_1.set_formats([fmt_int,fmt_int]);
    items.push({label:'buckets',value:renderer_1.render(o_buckets)});
    renderer_1.set_formats([fmt_dec_5,fmt_pct]);
    items.push({label:'IV',value:renderer_1.render(o_iv)});
    items.push({label:'monotonicity',value:o_monotonicity_sense});
    items.push({label:'p-value ('+pvalue_method+')',value:fmt_dec_5.format(pvalue)});
    items.push({label:' ',value:''});
    renderer_1.set_formats([fmt_int,fmt_pct]);
    items.push({label:'largest bucket',value:renderer_1.render(largest_bucket)});
    items.push({label:'smallest bucket',value:renderer_1.render(smallest_bucket)});
    items.push({label:'std_bucket_size',value:fmt_dec_2.format(std_bucket_size)});
    html +=modal_option_subblock(title,items);

    html +='</div>';
    html +='</div>';
    // -------------------------------------------------------------------------

    html +='</div>';
    // -------------------------------------------------------------------------

results.html = html;
return results;
}

