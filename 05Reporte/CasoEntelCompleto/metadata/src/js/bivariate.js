var bivariate = new GRMlab();
bivariate.module_name='bivariate';
bivariate.general_summary = true;


bivariate.__tooltip_position = function(point, params, dom, rect, size, align){

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

//---------------------------------------------------------------------------
bivariate.assign_field_renderer_custom = function(field_name,scope,data_type) {
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
        	if (scope.place_type=='modal') {
	          renderer.name='iv';
	          renderer.format_number = fmt_dec_3;
	          renderer.width_factor = 4;
	          renderer.color_map = new color_mapper({
	            type : 'numeric',
	            data_list : [null],
	            color_list : ['white_9']
	          });
	        }
	        else {
	        	renderer.format_number = fmt_num_basic;
				renderer.name='iv_old';
				renderer.width_factor = 1;
				renderer.color_map = new color_mapper({
					type : 'numeric',
					data_list : [0.05,0.5,1,null],
					color_list : ['red_1','white_9','orange_1','red_1']
					});	        		
	        }
	        break;        		        
	}
	if (renderer.name=='') return null;
	else return renderer;
}

bivariate.color_custom = { 
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
bivariate.modal_boxes_prepare_contents =  function(json) {
	console.log(json);

	// Custom functions
	// -------------------------------------------------------------------------
	this.modal_table_discriminant = function(v_data){
		let html = '';
		html += '<div></div>';;//'<div><h1 class="block_subtitle">' +'Discrimination Information' + '</h1></div>';
		html += this.iv_gini_level(v_data.iv,v_data.gini);
		html += '<div class="block_table_2"><div style="width:90%"><table style="width:85%;margin:0px 0px 5px 0px;">';
		//html += '<tr class="block_subtitle"><td>Common metrics</td></tr>';
		html += '<tr>' + '<td class=left style="min-width:90px;font-style:oblique;">' +'χ^2 test p-value' + '</td>' + '<td class="right value '+ this.asses_iv_gini('p_value',[v_data.pvalue_chi2]) +'">' + fmt_dec_3.format(v_data.pvalue_chi2) + '</td>' + '</tr>'
			+ '<tr>' + '<td class=left style="min-width:90px;font-style:oblique;">' +'Max. χ^2 p-value pairwise' + '</td>' + '<td class="right value '+ this.asses_iv_gini('p_value',[v_data.pvalue_chi2_max]) +'">' + fmt_dec_3.format(v_data.pvalue_chi2_max) + '</td>'+ '</tr>'
			+ '<tr>' + '<td class=left style="min-width:90px;font-style:oblique;">' +'Cramer-V' + '</td>' + '<td class="right value '+ this.asses_iv_gini('cramer_v',[v_data.cramer_v]) +'">' + fmt_dec_3.format(v_data.cramer_v) + '</td>' ;
		html += '</table>';

		if (v_data.dtype == 'numerical' || v_data.dtype == 'ordinal'){
			//html += '<span class="block_subtitle">Numerical variables</span>';
			html += '<table style="width:85%;margin:5px 0px 0px 0px;">';
			//html += '<tr class="block_subtitle"><td>For numerical & ordinal</td></tr>';
			html += '<tr>' + '<td class=left style="min-width:90px;font-style:oblique;">' +'Kruskal-Wallis test p-value' + '</td>' + '<td class="right value '+ this.asses_iv_gini('p_value',[v_data.pvalue_kruskal_wallis]) +'">' +fmt_dec_3.format(v_data.pvalue_kruskal_wallis) + '</td>'+ '</tr>'
					+ '<tr>' + '<td class=left style="min-width:90px;font-style:oblique;">' +'Anova test p-value' + '</td>' + '<td class="right value '+ this.asses_iv_gini('p_value',[v_data.pvalue_anova]) +'">' +fmt_dec_3.format(v_data.pvalue_anova) + '</td>'+ '</tr>'
					+ '<tr>' + '<td class=left style="min-width:90px;font-style:oblique;">' +'Kolmogorov-Smirnov' + '</td>' + '<td class="right value '+ this.asses_iv_gini('p_value',[v_data.pvalue_kolmogorov_smirnov]) +'">' +fmt_dec_3.format(v_data.pvalue_kolmogorov_smirnov) + '</td>'+ '</tr>'
					+ '<tr>' + '<td class=left style="min-width:90px;font-style:oblique;">' +'Wasserstein distance' + '</td>' + '<td class="right value">' +fmt_dec_3.format(v_data.wasserstein_distance) + '</td>'+ '</tr>'
					+ '<tr>' + '<td class=left style="min-width:90px;font-style:oblique;">' +'Divergence' + '</td>' + '<td class="right value">' +fmt_dec_3.format(v_data.divergence) + '</td>'+ '</tr>';
			html += '</table>';
		};

		html += '</div></div>';

		return html;
	};
	this.modal_table_temp_info = function(v_data){

		let html = "";
		html += '<div><h1 class="block_subtitle">' +'Temporal Information' + '</h1></div>';
		/*html +=	'<div class="block_table_2"><div style="width:90%"><table style="width:75%;margin:10px 0px 20px 0px;">'
			+ '<tr>' + '<td class:left style=min-width:90px;>' +'Global Stability'+ '</td>' + '<td class="value">' +v_data.temp_grp_size_stab_global + '</td>'+ '</tr>'
			+ '<tr>' + '<td class=left style=min-width:90px;>' +'Weighted Stability' + '</td>' + '<td class="value">' +v_data.temp_grp_size_stab_weighted + '</td>'+ '</tr>'
			+ '</table></div></div>';*/

    	return html;
	}
	this.modal_data_table_groups = function(v_data, scope){
		// Datatable data
	    // Discard last item (grand total)
	    var datatable_data = v_data.optimal_binning_table.data.slice(0, -1);
	    var datatable_columns = v_data.optimal_binning_table.columns.slice(0);

	    var color_column= [];
	    for (var i = 0; i < (v_data.optimal_binning_table.data.length - 1); i++) {
	        switch (v_data.optimal_binning_table.data[i][0]) {
	            case 'Missing':
	                color_column.push('#06a29f');
	                break;
	            case 'Special':
	                color_column.push('#9e50de');
	                break;
	            default:
	                if (v_data.optimal_binning_table.data[i+1][0] == 'Special' & v_data.group_others == 1) {
	                    color_column.push(blue_0);
	                }
	                else {
	                    color_column.push(blue_1);
	                }
	        }
	    }

	    // Todo: Change. Aditional color_column
	    var splits_pos = datatable_columns.indexOf("Splits");
	    for (var i = 0; i < datatable_data.length; i++) {
	        datatable_data[i] = datatable_data[i].slice(0);
	        datatable_data[i].unshift(color_column[i]);
	    }
	    datatable_columns.unshift('#color#');

	    //let datatable = view_datatable(datatable_columns,datatable_data,scope);
	    let datatable = this.datatables_prepare_datatable({columns:datatable_columns,data:datatable_data}, scope)

	    let html = '';
	    html += '<div><h1 class="block_subtitle">Optimal grouping details</h1></div>';
	    html += '<div class="optbin_datatable">';
	    html += datatable.html;
	    html += '</div>';

	    return {html: html, datatables: datatable};
	}

	this.modal_data_table_groups_basic = function(v_data, scope){
		// Datatable data
	    // Discard last item (grand total)
	    var datatable_data = v_data.basic_binning_table.data.slice(0, -1);
	    var datatable_columns = v_data.basic_binning_table.columns.slice(0);

	    var color_column= [];
	    for (var i = 0; i < (v_data.basic_binning_table.data.length - 1); i++) {
	        switch (v_data.basic_binning_table.data[i][0]) {
	            case 'Missing':
	                color_column.push('#06a29f');
	                break;
	            case 'Special':
	                color_column.push('#9e50de');
	                break;
	            default:
	                if (v_data.basic_binning_table.data[i+1][0] == 'Special' & v_data.group_others == 1) {
	                    color_column.push(blue_0);
	                }
	                else {
	                    color_column.push(blue_1);
	                }
	        }
	    }

	    // Todo: Change. Aditional color_column
	    var splits_pos = datatable_columns.indexOf("Splits");
	    for (var i = 0; i < datatable_data.length; i++) {
	        datatable_data[i] = datatable_data[i].slice(0);
	        datatable_data[i].unshift(color_column[i]);
	    }
	    datatable_columns.unshift('#color#');

	    //let datatable = view_datatable(datatable_columns,datatable_data,scope);
	    let datatable = this.datatables_prepare_datatable({columns:datatable_columns,data:datatable_data}, scope)

	    let html = '';
	    html += '<div></div>';
	    html += '<div class="optbin_datatable">';
	    html += datatable.html;
	    html += '</div>';

	    return {html: html, datatables: datatable};
	}

	this.modal_boxes_chart_groups_options = function(v_data) {

		let xAxis_Name ='';
	    switch (v_data.dtype) {
	        case 'numerical': xAxis_Name='Interval'; break;
	        case 'categorical': xAxis_Name='Values'; break;
	        case 'nominal': xAxis_Name='Values'; break;
	        case 'ordinal': xAxis_Name='Interval'; break;
	    }

	    var labels = [];
	    var labels_basic = [];
	    var color_column = [];
	    var color_column_basic = [];

	    // Prepare chart data
	    // EXclude the last element (grand total)
	    for (var i = 0; i < v_data.optimal_binning_table.data.length-1; i++) {
	        var label_el= {};
	        switch (v_data.optimal_binning_table.data[i][0]) {
	            case 'Missing':
	                label_el={value:'Missing',itemStyle:{textColor:red_1}}
	                color_column.push('#06a29f');
	                break;
	            case 'Special':
	                label_el={value:'Special',itemStyle:{color:blue_1}}
	                color_column.push('#9e50de');
	                break;
	            default:
	                if (v_data.optimal_binning_table.data[i+1][0] == 'Special' & v_data.group_others == 1) {
	                    label_el={value:(i+1)+'.'+v_data.optimal_binning_table.data[i][0],itemStyle:{color:blue_0}}
	                    color_column.push(blue_0);
	                }
	                else {
	                    label_el={value:(i+1)+'.'+v_data.optimal_binning_table.data[i][0],itemStyle:{color:blue_1}}
	                    color_column.push(blue_1);
	                }
	        }
	        labels.push(label_el);
	    }

	    // Prepare chart data
	    // EXclude the last element (grand total)
	    for (var i = 0; i < v_data.basic_binning_table.data.length-1; i++) {
	        var label_el= {};
	        switch (v_data.basic_binning_table.data[i][0]) {
	            case 'Missing':
	                label_el={value:'Missing',itemStyle:{textColor:red_1}}
	                color_column_basic.push('#06a29f');
	                break;
	            case 'Special':
	                label_el={value:'Special',itemStyle:{color:blue_1}}
	                color_column_basic.push('#9e50de');
	                break;
	            default:
	                if (v_data.basic_binning_table.data[i+1][0] == 'Special' & v_data.group_others == 1) {
	                    label_el={value:(i+1)+'.'+v_data.basic_binning_table.data[i][0],itemStyle:{color:blue_0}}
	                    color_column_basic.push(blue_0);
	                }
	                else {
	                    label_el={value:(i+1)+'.'+v_data.basic_binning_table.data[i][0],itemStyle:{color:blue_1}}
	                    color_column_basic.push(blue_1);
	                }
	        }
	        labels_basic.push(label_el);
	    }

		let option = 
			{
				// Elimino tooltip de momento.
			    //tooltip: {
			    //  trigger: 'axis',
			    //},
			    grid: {left: '3%',right: '8%',bottom: 0,top:35,containLabel: true},
			    toolbox: {
			    	show: true,
			    	showTitle:false,
			        feature: {
			        	showTitle:false,
			        	myTool1:{
			        		grmlab_switch:true,
			        		switch_options:['Optimal','Percentiles'],
			        		switch_selected:0,
			        		show: true,
			        		icon: 'path://M432.45,595.444c0,2.177-4.661,6.82-11.305,6.82c-6.475,0-11.306-4.567-11.306-6.82s4.852-6.812,11.306-6.812C427.841,588.632,432.452,593.191,432.45,595.444L432.45,595.444z M421.155,589.876c-3.009,0-5.448,2.495-5.448,5.572s2.439,5.572,5.448,5.572c3.01,0,5.449-2.495,5.449-5.572C426.604,592.371,424.165,589.876,421.155,589.876L421.155,589.876z M421.146,591.891c-1.916,0-3.47,1.589-3.47,3.549c0,1.959,1.554,3.548,3.47,3.548s3.469-1.589,3.469-3.548C424.614,593.479,423.062,591.891,421.146,591.891L421.146,591.891zM421.146,591.891',
			        		title: 'Opt/Basic binning toggle',
	                		onclick: function (event_info){
	                			let mytool= event_info._componentsMap.data.toolbox[0].option.feature.myTool1;
								if (mytool.switch_selected== 1) {
									mytool.switch_selected= 0;
								}
								else  {
									mytool.switch_selected= 1;
								}
								event_info.scheduler.ecInstance.dispatchAction({
								    type: 'legendToggleSelect',
								    // legend name
								    name: 'Records'
								});
								event_info.scheduler.ecInstance.dispatchAction({
								    type: 'legendToggleSelect',
								    // legend name
								    name: 'PD'
								});
								event_info.scheduler.ecInstance.dispatchAction({
								    type: 'legendToggleSelect',
								    // legend name
								    name: 'Records_basic'
								});
								event_info.scheduler.ecInstance.dispatchAction({
								    type: 'legendToggleSelect',
								    // legend name
								    name: 'PD_basic'
								});

								// // Change the x axis.
								let options = event_info.scheduler.ecInstance.getOption()

								let xAxis1 = options.xAxis.pop()
								let xAxis2 = options.xAxis.pop()
								
								let data_swap = xAxis1.data
								xAxis1.data = xAxis2.data
								xAxis2.data = data_swap

								options.xAxis.push(xAxis1)
								options.xAxis.push(xAxis2)

								event_info.scheduler.ecInstance.setOption(options)
                			}
				        },
			        },
			    },

			    tooltip: {
		            trigger: 'axis',
			        axisPointer:{
			        	type:"none"
			        },
		            position: function (point, params, dom, rect, size) {
		                return this.bivariate.__tooltip_position(point, params, dom, rect, size);
		            },
		            formatter: function(params){
		                let html = '';
		                let tooltip_title = "Group: "

                        params_filtered = params.filter(function(value){
                            return value.data != null
                        })

                        let group_name = params[0].name;
		                html += "<div class='tooltip'>";

		                let xAxis_Name = params_filtered[0].axisId;
		                // Force "tooltip xAxis label" for Missing and Special groups
		                if (group_name == 'Missing' || group_name== 'Special'){
		                    html += "<span class='blue_labels'>Values:</span>";
		                    html += "<span class='f12'>&nbsp;"+group_name+"</span>";
		                }
		                else {
		                    html += "<span class='blue_labels'>"+xAxis_Name+":</span>";
		                    // Remove the index number
		                    group_name = params_filtered[0].name.substr(1+params_filtered[0].name.indexOf('.'));
		                    html += "<span class='f12'>&nbsp;"+group_name+"</span>";
		                }

		                html += "<div><table>";
		                html += "<tr><td></td><td></td></tr><tr><td></td><td></td></tr><tr><td></td><td></td></tr>";

		                html+="<tr>";
		                html+='<td class="element" style="color:'+params_filtered[0].color+'">&#x25b0;</td> ';
		                html+="<td class='blue_labels'>";
	                    html+='<span class="i">Records:</span></td>';
	                    html+="<td class='right value'>";
	                    html+=fmt_int.format(params_filtered[0].value)+'</td>';
		                html += "</tr>";

		                html += "<tr><td></td><td></td></tr><tr><td></td><td></td></tr><tr><td></td><td></td></tr>";

                        if (params_filtered.length > 1){
    		                html+="<tr>";
    		                html+='<td class="element" style="color:'+params_filtered[1].color+'">&bull;</td> ';
    		                html+="<td class='blue_labels'>";
    	                    html+='<span class="i">Event Rate:</span></td>';
    	                    html+="<td class='right value'>";
    	                    html+=fmt_pct_0_2.format(params_filtered[1].value) + '</td>';
                            html += "</tr>"
                        }

		                html += "</table></div>";
		                return html;
		            },
		            extraCssText: ec_tooltip,
		        },

			    yAxis: [
			        {   type: 'value',
			            //name: 'Records',
			            splitLine: {show: true,lineStyle: {color: '#45567899'}},
			            axisLabel: {
							SDAfontSize: 10,color:'#8999b9',fontSize: 10,
						},
			            axisLine:{
								lineStyle:{
			            			color:'#8999b9',
			            		}
			            },
			           
			        },
			    	{   type: 'value',
			            name: 'Event Rate',
			            nameLocation: "middle",
			            nameRotate: 270,
            			nameGap: 35,
            			splitLine: {show: false,lineStyle: {etype:'dotted',color: '#ea923466'}},
			            axisLabel: {
			                color:'#ea9234',fontSize: 10,
							formatter: function(x){ return fmt_dec_max1.format(x*100)+'%';}
			            },

			            axisLine:{
								lineStyle:{color: '#ea9234', type: "dashed"}
			            },
			        } 
			    ],
			    series: [],
			    xAxis: [],
				legend:[]
			};
			
			// Info for optimal binning
			var opt_bin_data = v_data.optimal_binning_table.data;
			var opt_splits = []
			var opt_records = []

            var opt_records_other = []
            var opt_records_special = []
            var opt_records_missing = []
			
            var opt_event_rate = []
			var opt_event_rate_miss = [];
			
			
			for (var i = 0; i < opt_bin_data.length-1; i++) {
			
				//opt_records.push(opt_bin_data[i][1])
			
				if(opt_bin_data[i][0] == "Special" || opt_bin_data[i][0] == "Missing") {
					opt_event_rate.push(null)
                    opt_records.push(null)
                    opt_records_other.push(null)
					opt_event_rate_miss.push(opt_bin_data[i][4])
					if (opt_bin_data[i][0] == "Special"){
                        opt_records_special.push(opt_bin_data[i][1])
                        opt_records_missing.push(null)
						opt_splits.push('Special')
					}
					if (opt_bin_data[i][0] == "Missing"){
						opt_splits.push('Missing')
                        opt_records_special.push(null)
                        opt_records_missing.push(opt_bin_data[i][1])
					}
				} else if (opt_bin_data[i][0] != "" ){
                    if (v_data.optimal_binning_table.data[i+1][0] == 'Special' & v_data.group_others == 1) {
                        opt_records_other.push(opt_bin_data[i][1])
                        opt_event_rate_miss.push(opt_bin_data[i][4])
                        opt_event_rate.push(null)
                        opt_records.push(null)
                        opt_records_special.push(null)
                        opt_records_missing.push(null)
                        opt_splits.push(i+1)
                    }
                    else{
                        opt_records.push(opt_bin_data[i][1])
                        opt_event_rate.push(opt_bin_data[i][4])
                        opt_records_other.push(null)
                        opt_event_rate_miss.push(null)
                        opt_records_special.push(null)
                        opt_records_missing.push(null)
                        opt_splits.push(i+1)
                    }
                } else{
                    opt_records_other.push(null)
                    opt_event_rate.push(null)
                    opt_records.push(null)
                    opt_records_missing.push(null)
                    opt_records_special.push(null)
                }
			}


			// Info for basic binning
			var basic_bin_data = v_data.basic_binning_table.data;
			var basic_splits = []
			var basic_records = []

            var basic_records_special = []
            var basic_records_missing = []

			var basic_event_rate = []
			var basic_event_rate_miss = [];

			for (var i = 0; i < basic_bin_data.length-1; i++) {
			
				if (basic_bin_data[i][0] != "Special" && basic_bin_data[i][0] != "Missing" && basic_bin_data[i][0] != "" ){
                    basic_records.push(basic_bin_data[i][1])
					basic_event_rate.push(basic_bin_data[i][4])
                    basic_records_special.push(null)
                    basic_records_missing.push(null)
					basic_event_rate_miss.push(null)
					basic_splits.push(i+1)
				} else {
					basic_event_rate.push(null)
                    basic_records.push(null)
					basic_event_rate_miss.push(basic_bin_data[i][4])
					if (basic_bin_data[i][0] == "Special"){
						basic_splits.push('Special')
                        basic_records_special.push(basic_bin_data[i][1])
                        basic_records_missing.push(null)
					}
					if (basic_bin_data[i][0] == "Missing"){
						basic_splits.push('Missing')
                        basic_records_special.push(null)
                        basic_records_missing.push(basic_bin_data[i][1])
					}
				}
			}

			option.xAxis.push({
				//id: 'x_opt', 
				 type: 'category',
				 //data: opt_splits,
				 position: 'bottom',
				 axisLabel: {
				 	show:true,
				 	color:'#8999b9',
				 	fontSize: 10,
				 	formatter: function(x){
	                    if (x == 'Special') return 'S';
	                    if (x == 'Missing') return 'M';
	                    // only the index
	                    else return x.split('.')[0];
	                }
				 },
				 axisLine: {show:true,lineStyle: {color:'#8999b9'}},  
				 show:true,
				 id: xAxis_Name,
				 data: labels,
				});

			option.xAxis.push({
				id: 'x_basic',   
				 type: 'category',
				 data: labels_basic,
				 position: 'bottom',
				 axisLabel: {
				 	show:true,
				 	color:'#8999b9',
				 	fontSize: 10,
				 	formatter: function(x){
	                    if (x == 'Special') return 'S';
	                    if (x == 'Missing') return 'M';
	                    // only the index
	                    else return x.split('.')[0];
	                }
				 },
				 axisLine: {show:true,lineStyle: {color:'#8999b9',}},  
				 show:false
				});



			option.series.push({
				  name:'Records',
				  id: 'y_opt_records',
			      type:'bar',
                  stack: "opt_records",
			      data:opt_records,
			      color: color['medium_blue_light'],
			      yAxisIndex: 0,
			      markLine: false
				});
            option.series.push({
                  name:'Records',
                  id: 'y_opt_records_other',
                  type:'bar',
                  stack: "opt_records",
                  data:opt_records_other,
                  color: blue_0,
                  yAxisIndex: 0,
                  markLine: false
                });
            option.series.push({
                  name:'Records',
                  id: 'y_opt_records_miss',
                  type:'bar',
                  stack: "opt_records",
                  data:opt_records_missing,
                  color: '#06a29f',
                  yAxisIndex: 0,
                  markLine: false
                });
            option.series.push({
                  name:'Records',
                  id: 'y_opt_records_spec',
                  type:'bar',
                  stack: "opt_records",
                  data:opt_records_special,
                  color: '#9e50de',
                  yAxisIndex: 0,
                  markLine: false
                });
			option.series.push({
				  name:'PD',
				  id: 'y_opt_pd',
			      type:'line',
			      data:opt_event_rate ,
			      color: color['orange'],
			      yAxisIndex: 1,
				});
			option.series.push({
				  name:'PD',
				  id: 'y_opt_pd_miss',
			      type:'line',
			      data:opt_event_rate_miss ,
			      color: color['orange'],
			      yAxisIndex: 1,
			      lineStyle:{width:0}
				});
			option.series.push({
				  name:'Records_basic',
				  id: 'y_basic_records',
			      type:'bar',
                  stack: "basic_records",
			      data:basic_records,
			      color: color['medium_blue_light'],
			      yAxisIndex: 0,
			      markLine: false
				});
            option.series.push({
                  name:'Records_basic',
                  id: 'y_basic_records_miss',
                  type:'bar',
                  stack: "basic_records",
                  data:basic_records_missing,
                  color: '#06a29f',
                  yAxisIndex: 0,
                  markLine: false
                });
            option.series.push({
                  name:'Records_basic',
                  id: 'y_basic_records_spec',
                  type:'bar',
                  stack: "basic_records",
                  data:basic_records_special,
                  color: '#9e50de',
                  yAxisIndex: 0,
                  markLine: false
                });

			option.series.push({
				  name:'PD_basic',
				  id: 'y_basic_pd',
			      type:'line',
			      data:basic_event_rate ,
			      color: color['orange'],
			      yAxisIndex: 1,
				});
			option.series.push({
				  name:'PD_basic',
				  id: 'y_basic_pd_miss',
			      type:'line',
			      data:basic_event_rate_miss ,
			      color: color['orange'],
			      yAxisIndex: 1,
			      lineStyle:{width:0}
				});

			option.legend.push({
				data:['Records' ,'PD','PD','Records_basic' ,'PD_basic','PD_basic'],
				selected:{
					'Records':true,
					'PD':true,
					'PD':true,
					'Records_basic':false,
					'PD_basic':false,
					'PD_basic':false,
				},
				show:false

			})

			return option;
	};

	this.modal_boxes_chart_groups_temp_options = function(v_data) {
		let option = 
			{
				color:[
            '#175da4','#49a5e6','#2dcccd','#d8be75','#f35e61','#61d178','#ac6f2e','#dfff54','#ff53a5','#006568'
        		],
				grid: {left: '8%',right: '8%',bottom: 37,top:5,containLabel: true},
				tooltip: {
					trigger: 'axis',
			        axisPointer:{
			        	type:"line"
			        },
			        position: function (point, params, dom, rect, size) {
		                return this.bivariate.__tooltip_position(point, params, dom, rect, size);
		            },
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
			    toolbox: {
			        feature: {
			        }
			    },

			   yAxis: [
			     	{   type: 'value',
			     		name: 'Event Rate',
			            nameLocation: "middle",
			            nameRotate: 90,
            			nameGap: 35,
 						axisLabel: {
							SDAfontSize: 10,
							color:'#8999b9',fontSize: 10
						},
						splitLine: {show: true,lineStyle: {color: '#45567899'}},
			        	axisLine:{
							lineStyle:{
			            		color:'#8999b9',
			            	}
			        	},
			        }

		    	],
			    series: [],
			    xAxis: [],
			    legend: [],
			    animationDuration: 300,
		
			};
			

			var temporal_data = [];
			var auxiliar_vector = [];

		console.log(v_data)
			for (var i = 0; i < v_data.temp_split_count_by_date.length; i++) {
				auxiliar_vector = []
				for (var j = 0; j < v_data.temp_split_count_by_date[0].length; j++) {
					if (v_data.temp_split_count_by_date[i][j] == 0) {
						auxiliar_vector.push(0)
					} else {
						auxiliar_vector.push(v_data.temp_split_event_by_date[i][j]/v_data.temp_split_count_by_date[i][j])
					}

				}
				temporal_data.push(auxiliar_vector)
				
			}

			option.xAxis.push({
				  /*axisPointer:{
				    type:'line',z:0,
				    shadowStyle:{color:'rgba(150,150,150,0.1)'},
				  },*/
				  type: 'category',
				  data: v_data.dates,
				  boundaryGap: false,
				  axisLabel: {color:'#8999b9',fontSize: 10,},
				  axisLine: {
				  	symbol: ['none', 'arrow'],
				  	symbolOffset:[0, 8],
                	symbolSize:[6, 10],
				  	lineStyle: {color:'#8999b9'}},  


			});

			legend_labels = [];
			str_aux = "Gr. "
			for (var i = 0; i < temporal_data.length-2; i++) {
				legend_labels.push(str_aux.concat(i+1))
			}
			legend_labels.push(str_aux.concat("S"))
			legend_labels.push(str_aux.concat("M"))

			for (var i = 0; i < temporal_data.length; i++) {
				option.series.push({
					symbol:'none',
					name: legend_labels[i],
				    type:'line',
				    data: temporal_data[i] ,
				      
					});
			};
			
			option.legend.push({
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
	            data:legend_labels,
			})
			return option;
	};

	this.modal_boxes_groups = function(v_data, scope){
		let html = "";
		chart = this.echarts_prepare_chart(this.modal_boxes_chart_groups_options(v_data),scope);
		html += '<div><h1 class="block_subtitle">Group analysis</h1></div><div></div>';
		html += '<div class="echart_chart" style="padding:0px;" id="' + chart.html_element_id + '"></div>';//chart.html
		return {html: html, graphs: chart};
	}

	this.modal_boxes_groups_temp = function(v_data, scope){

		let info_stability = v_data['temp_split_div_uniform'];
    	let info_stability_w = v_data['temp_split_div_exponential'];

		let assesment_stability = asses_stability(info_stability,info_stability_w);

		let html = "";
		chart = this.echarts_prepare_chart(this.modal_boxes_chart_groups_temp_options(v_data),scope);

		html += '<div><h1 class="block_subtitle">Temporal group analysis</h1></div>';

		html += '<div class="block_table_2">';
	    html += '<table style="width:88%;">';
	    html += '<tr>';
	    html += '<td>Group size divergence:</td>';
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

		html += '<div class="echart_chart" style="padding:0px;" id="' + chart.html_element_id + '"></div>'
		return {html: html, graphs: chart};
	}

	this.asses_iv_gini = function(variable,values) {
		switch (variable) {
			case 'gini':
				switch (true) {
					case (values[0] < 0.025): return 't_red b';
					case (values[0] < 0.05): return 't_orange b';
					case (values[0] > 0.80 && values[0] < 0.85): return 't_orange b';
					case (values[0] >= 0.85): return 't_red b';
				}
				return;
			case 'iv':
				switch (true) {
					case (values[0] < 0.05): return 't_red b';
					case (values[0] > 0.50 && values[0] < 1.00): return 't_orange b';
					case (values[0] >= 1.00): return 't_red b';
				}
				return;
			case 'p_value':
				switch (true) {
					case (values[0] < 0.1 && values[0] > 0.05 ): return 'orange';
					case (values[0] >= 0.1): return 'red';
				}
				return;
			case 'p_value_inverse':
				switch (true) {
					case (values[0] < 0.1 && values[0] > 0.05 ): return 'orange';
					case (values[0] <= 0.05): return 'red';
				}
				return;
			case 'cramer_v':
				switch (true) {
					case (values[0] < 0.1): return 'red';
					case (values[0] < 0.15): return 'orange';
				}
				return;
		}
		return '';
	};

	this.iv_gini_level = function(iv, gini) {

	    let html = '';

	    var iv_3=fmt_dec_3.format(iv).split(".",2);
	    var gini_perc_2=fmt_dec_max2.format(gini*100).split(".",2);
	    if (typeof iv_3[1] == 'undefined') iv_3[1]='';
	    else iv_3[1]='.'+iv_3[1];
	    if (typeof gini_perc_2[1] == 'undefined') gini_perc_2[1]='';
	    else gini_perc_2[1]='.'+gini_perc_2[1];

	    var asses_iv = this.asses_iv_gini('iv',[iv]);
	    var asses_gini = this.asses_iv_gini('gini',[gini]);

	    html+='<div class="big_number_3" style="margin:10px 0px">';

	    html+='<div class="big_element" style="width:30%">';
	    html+='<div>';
	    //html+='<svg preserveAspectRatio="none" style="vertical-align:middle;margin-right:2px;" viewBox="0 0 100 7" height="5px" width="10px"><path fill="'+color['yellow_medium']+'" d="M 0 0 L100 0 L85 7 L0 7 z"/></svg>';
	    html+='<span class="label xt_missing" style="font-size:15px;">'+'IV'+'</span>';
	    html+='</div>';
	    html+='<div class="main_value '+asses_iv+'"><span class="main_value_small">'+iv_3[0]+'</span>';
	    html+=iv_3[1];
	    html+='</div>';
	    //html+='<div class="extra">'+fmt_int.format(missing)+'</div>';
	    html+='</div>';

	    html+='<div class="big_element" style="width:30%">';
	    html+='<div>';
	    //html+='<svg preserveAspectRatio="none" style="vertical-align:middle;margin-right:2px;" viewBox="0 0 100 7" height="5px" width="10px"><path fill="'+color['yellow_medium']+'" d="M 0 0 L100 0 L85 7 L0 7 z"/></svg>';
	    html+='<span class="label xt_special" style="font-size:15px;">'+'Gini'+'</span>';
	    html+='</div>';
	    html+='<div class="main_value '+asses_gini+'">'+gini_perc_2[0]+'';
	    html+='<span class="main_value_small">'+gini_perc_2[1]+'%</span>';
	    html+='</div>';
	    //html+='<div class="extra">'+fmt_int.format(special)+'</div>';
	    html+='</div>';

	    html+='</div>';
	    return html;
	};

	// Initialize
	// -------------------------------------------------------------------------
	let results = {html:'',graphs: [],datatables: [],content_class:''};
	let v_data = json.data;
	v_data.version = json.layout_version;
	console.log(v_data);
	// ToDo: get scope from json data, include the list in model (MVC);
	let scope = {item_type:'bivariate',step_type:'analysis',place_type:'modal'};

	// Prepare data
	// -------------------------------------------------------------------------
	let box_title  = this.modal_boxes_html_title(v_data);

	let table_dicriminant_info = this.modal_table_discriminant(v_data);
	let table_temp_info = this.modal_table_temp_info(v_data);

	let chart_1 = this.modal_boxes_groups(v_data,scope);
	let datatable_1 = this.modal_data_table_groups(v_data,scope);
	//let datatable_1 = this.modal_data_table_groups_basic(v_data,scope);
	let chart_2 = this.modal_boxes_groups_temp(v_data,scope);

	// Template
	// -------------------------------------------------------------------------
	let html = '';
	html += '<div class="first_column">'
	html += '<div style="grid-area: r1;">' + box_title + '</div>';
	html += '<div style="grid-area: r2;">' + table_dicriminant_info + '</div>';
	//html += '<div class="row_3">' + table_temp_info + '</div>';
	html += '<div class="row_3">' + chart_1.html  + '</div>';
	html += '</div>'
	html += '<div class="second_column">'
    html += '<div class="row_1">' + chart_2.html + '</div>';
    html += '<div class="row_2">' + datatable_1.html + '</div>';
    html += '</div>';
	
	// -------------------------------------------------------------------------

	// Prepare results
	// -------------------------------------------------------------------------
	results.content_class = 'modal_bivariate';

	results.graphs.push(chart_1.graphs);
	results.graphs.push(chart_2.graphs);

	results.datatables.push(datatable_1.datatables);

	results.html = html;

	return results;
}

//------------------------------------------------------------------------
// GLOBAL SUMMARY Bivariaate
//------------------------------------------------------------------------

//---------------------------------------------------------------------------
bivariate.__global_left_sidebar_01 = function (tables_data, flag_title = true, big_elements = 999, table_elements = 999) {
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
bivariate.__chart_cpu_time = function(tables_data){
    
    var operation_type = ["total"];
    
    var var_types = tables_data["index"].filter(function(value){return (value == "total")? false: true;});
    var time_spend_by_var_type = tables_data["data"].filter(function(value, idx){
        return (tables_data["index"][idx] == "total")? false: true;});

    option = {
        tooltip: {
            trigger: 'item',
            position: function (point, params, dom, rect, size) {
                return this.bivariate.__tooltip_position(point, params, dom, rect, size);
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
                barBorderRadius: 2,
            }

        }]
    };

    // plots
    let chart = this.echarts_prepare_chart(option,{});
    return chart;
};
bivariate.__chart_apply_summary = function(tables_data){
    
    //console.log(tables_data);
    var vars_values = tables_data["data"];
    var column_names = tables_data["columns"];
    let xAxis_max= 0;
    // initialize objetcs
    var data = {};
    let info_to_show = ["keep", "remove", "review"];
    for (let i = 0; i < info_to_show.length; i++){
        data[info_to_show[i]] = {nominal: {"num": 0}, 
            categorical: {"num": 0}, ordinal: {"num": 0}, 
            numerical: {"num": 0}, global: {"num": 0}};
    };

    // filter keep and tranformed elements
    vars_values.forEach(function(value){
		let apply_action = value[column_names.indexOf("action")]
	  	// For this graph, we consider "warning variables" as keep.
    	// To be redefined
    	if (apply_action === "warning"){
    		apply_action = "keep"
    	}
        data[apply_action].global["num"] += 1;
        xAxis_max += 1;
        data[apply_action][value[column_names.indexOf("dtype")]]["num"] += 1;
    });

    // reasons for transformation or elimination:
    for (orden of Object.keys(data)){
        for (tipo of Object.keys(data[orden])){
            // filter only the variables transformed
            vars_values.filter(function(value){
                if (tipo == "global"){
                    return (value[column_names.indexOf("action")] == orden)? true:false;
                }
                else{
                    return (value[column_names.indexOf("action")] == orden && 
                        value[column_names.indexOf("dtype")] == tipo)? true:false;
                }
            }).map(function(value){
                return value[column_names.indexOf("case")]
            }).filter(function(value, index, self){
                return self.indexOf(value) === index;
            });
        }
    };

  
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
                return this.bivariate.__tooltip_position(point, params, dom, rect, size, "right");
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
            max: xAxis_max*1.25,
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
bivariate.__chart_warns_by_type = function(tables_data){
    

	ind_comments = 4
	ind_type = 1


	// Metric individual counters
	let count_IV = 0
	let count_gini = 0	
	let count_chi2_max = 0	
	let count_chi2 = 0	
	let count_vcramer = 0	
	let count_anova = 0	
	let count_ks = 0	
	let count_kw = 0	
	let count_median = 0
	let count_undef_mon = 0	
	let count_check = 0	

	let num_variables = tables_data.data.length
	let num_numerical_variables = 0 

	// Comments count
	for (let i = 0; i < num_variables; i++) {
		num_comments = tables_data.data[i][ind_comments].length
		count_check += num_comments
		if(tables_data.data[i][ind_type]=== "numerical" ||  tables_data.data[i][ind_type]=== "ordinal"){
			num_numerical_variables += 1
		}

		for (let j = 0; j < num_comments; j++){

			switch(tables_data.data[i][ind_comments][j].substring(0, 13)){
        		case "IV value belo":
        			count_IV += 1
 		       		break;	
            	case "IV value abov":
        			count_IV += 1
 		       		break;	
            	case "gini value ab":
       				count_gini += 1
 		       		break;
        		case "gini value be":
       				flag_gini = 1	
 		       		break;
        		break;
        		case "pvalue_chi2_m":
					count_chi2_max += 1
        		break;
        		case "cramer_v valu":
        			count_vcramer += 1
        		break;
        		case "pvalue_anova ":
            		count_anova += 1
        		break;
            	case "pvalue_kolmog":
            	case "pvalue_ks val":
            		count_ks += 1
        		break;
            	case "pvalue_kruska":
            	case "pvalue_kw val":
            		count_kw += 1
        		break;
            	case "pvalue_median":
            		count_median += 1
        		break;
            	case "pvalue_chi2 v":
            		count_chi2 += 1
        		break;
            	case "Undefined mon":
            	case "undefined mon":
            		count_undef_mon += 1
        		break;
        		default:
     	        console.log('Warning: An identified comment was recorded: ',tables_data.data[i][ind_comments][j])
     	        
    		}
		}
	}

	// For every type of variable
	let count_warns = [count_IV, count_gini,count_chi2,count_chi2_max,count_vcramer,count_anova,count_ks,count_kw,count_median,count_undef_mon]
	let  name_warns_gen = ["IV","Gini","Chi2 p-value","Chi2 p-value pairwise", "Cramer-V"]

	// Only for numerical variables
	let  name_warns_num = ["Anova p-value","Kruskal-Wallis p-value","Kolmogorov-Smirnov p-value","Median test p-value","Undef. Monotonicity"]


    var vars_values = tables_data["data"];
    var column_names = tables_data["columns"];
  
  
    //BP colors
    var color_all = color.red_dark;

    var color_text_legend = color.red;



    // initialize objetcs
    var data_gen = {};
    var data_num = {};
    let info_to_show = ["ok", "warning"];
    

    data_gen["warning"] = {count_IV: {"num": count_warns[0]}, count_gini: {"num": count_warns[1]},count_chi2: {"num": count_warns[2]},
    					count_chi2_max: {"num": count_warns[3]}, count_vcramer: {"num": count_warns[4]}};
  
    data_gen["ok"] = {count_IV: {"num": num_variables - count_warns[0]}, count_gini: {"num": num_variables - count_warns[1]},count_chi2: {"num": num_variables - count_warns[2]},
    					count_chi2_max: {"num": num_variables - count_warns[3]}, count_vcramer: {"num": num_variables - count_warns[4]}};
  
  
  	data_num["warning"] = {count_anova: {"num": count_warns[5]},count_ks: {"num": count_warns[6]},
  							count_kw: {"num": count_warns[7]}, count_median: {"num": count_warns[8]},
  							count_undef_mon: {"num": count_warns[9]}};
  
    data_num["ok"] = {count_anova: {"num": num_numerical_variables - count_warns[5]}, count_ks: {"num": num_numerical_variables - count_warns[6]},
    					count_kw: {"num": num_numerical_variables - count_warns[7]},count_median: {"num": num_numerical_variables - count_warns[8]},
    					count_undef_mon: {"num": num_numerical_variables - count_warns[9]}};
    



     // graph
    option_gen = {
        color: [color.core_blue_light, color.orange_medium],
        tooltip: {
            trigger: 'axis',
            axisPointer:{
                type: 'shadow'
            },
            position: function (point, params, dom, rect, size) {
                return this.bivariate.__tooltip_position(point, params, dom, rect, size);
            },
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
            top: '10%',
            bottom: '20%',
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
            data: name_warns_gen,
            position: "top",
            axisLabel:{ 
                padding: [-31, 0, 0, -7],inside: true, 
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
        option_gen.series.push({
            type: 'bar',
            data: Object.values(data_gen[value]).map(function(value){ return value["num"] }),
            name: value,
            itemStyle:{
                barBorderRadius: 0,
            },
            barWidth: "14",
            stack: '100',
        });
    });

	option_num = {
        color: [color.core_blue_light, color.orange],
        tooltip: {
            trigger: 'axis',
            axisPointer:{
                type: 'shadow'
            },
            position: function (point, params, dom, rect, size) {
                return this.bivariate.__tooltip_position(point, params, dom, rect, size);
            },
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
            top: '10%',
            bottom: '20%',
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
            //max: num_numerical_variables,
        }],
        yAxis: [{
            type: 'category',
            data: name_warns_num,
            position: "top",
            axisLabel:{ 
            	padding: [-31, 0, 0, -7],inside: true, inside: true, 
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
        option_num.series.push({
            type: 'bar',
            data: Object.values(data_num[value]).map(function(value){ return value["num"] }),
            name: value,
            itemStyle:{
                barBorderRadius: 0,
            },
            barWidth: "14",
            stack: '100',
        });
    });

    // plots
    let chart_gen = this.echarts_prepare_chart(option_gen,{});
    let chart_num = this.echarts_prepare_chart(option_num,{});

    return [chart_gen, chart_num];
};
bivariate.__chart_iv_get_options = function(array_iv,array_gini,array_chi2,array_chi2max,array_cramer_v) {

	let option = 
		{
		xAxis: {
	    	type: 'category',
	    },
	    yAxis: {
		    type: 'value',
		    name: 'IV',
		    axisLabel: {
				SDAfontSize: 10,fontSize: 12,
				fontFamily: 'open sans',
				color:color['aqua_white'],
			},
			axisLine:{
				lineStyle:{
			   	color:color['aqua_white'],
			   	}
			}
		},
		series: [{
		    name: 'IV',
		    data: array_iv,
		    type: 'line',
		    color: color['aqua_white'],
		}],
	};
	return option;
};
bivariate.__chart_warns_agg = function(tables_data){
    

    ind_comments = tables_data["columns"].indexOf("status");
    ind_type = tables_data["columns"].indexOf("dtype");


    // Metric individual counters
    let count_agg = {};//{1:{}, 2:{}, 3:{}, 4:{}, 5:{}, 6:{}};
    let count_all = {};//{1:0, 2:0, 3:0, 4:0, 5:0, 6:0}

    let num_variables = tables_data.data.length

    // Comments count
    for (let i = 0; i < num_variables; i++) {
        num_comments = tables_data.data[i][ind_comments].length;
        if (num_comments > 0){
        	if (!(num_comments in count_agg)){
        		count_agg[num_comments] = {}
        		count_all[num_comments] = 0;
        	}
            count_all[num_comments] += 1;
            key_comment = tables_data.data[i][ind_comments].sort().join("__");
            if (key_comment in count_agg[num_comments]){
                count_agg[num_comments][key_comment] += 1;
            }  else{
                count_agg[num_comments][key_comment] = 1;
            }
        }
    }

    // graph
    let option = {
        tooltip: {
            trigger: 'axis',
            axisPointer:{
                type: 'shadow'
            },
            position: function (point, params, dom, rect, size) {
                return this.bivariatecontinuous.__tooltip_position(point, params, dom, rect, size);
            },
            formatter: function(params){
                let html = "";
                let alert_types = count_agg[params[0].axisValue]
                html += "<div class='tooltip'>";
                html += "<span class='blue_labels'>Records with " + params[0].axisValue + " simultaneous warnings</span>";
                html += "<div>";
                html += "<p> </p><table>";
                html += "<tr style='vertical-align: top;'>";
                html += '<td class="element" style="color:' + params[0].color + '">&#x25b0;</td> ';
                html += "<td class='blue_labels'>";
                html += '<span class="i">records:</span></td>';
                html += "<td class='right value'>";
                html += params[0].value;
                html += "</td></tr>";
                html += "</table>";
                html += "</div>";

                html += "<p> </p><span class='blue_labels'>Disaggregated by warning type:</span>";
                html += "<div><p> </p><table>";
                for (key_alert in alert_types){
                    html += '<tr><td class="element" style="color:' + params[0].color + '">&#x002D;</td>';
                    alert_array = key_alert.split("__")
                    html += "<td class='blue_labels'><span class='i'>";
                    html += alert_array[0] + "</span></td>";
                    for (j = 1; j<alert_array.length; j++){
                        html += "</tr><tr><td></td><td class='blue_labels'><span class='i'>";
                        html += alert_array[j] + "</span></td>";
                    }
                    html += "<td class='right value'>";
                    html += alert_types[key_alert];
                    html += "</td></tr>";
                }
                html += "</table></div>";
                html += "</div>";
                


                
                return html;
            },
            extraCssText: ec_tooltip,
        },
        grid:{
            left: '7%',
            right: '5%',
            bottom: '15%',
            top: '7%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: Object.keys(count_all),
            axisTick:{
                //interval:0
            },
            axisLabel:{
                color: this.color_custom.axisLabelColor,
                align: "right",
            },
            axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
            name: "num of warnings per record",
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
            name: "num of records",
            nameLocation: "middle",
            nameRotate: 90,
            nameGap: 35,
        },
        series: {
            name: "records",
            data: Object.values(count_all),
            type: 'bar',
            barMaxWidth: '65%',
            color: color.aqua_dark,
        },
    };

    // plots

    return this.echarts_prepare_chart(option,{});;
};
bivariate.__chart_stats_get_options = function(selected,array_iv,array_gini,array_chi2,array_chi2max,array_cramer_v,parameters) {
	let x_data = [];
	let len = array_iv.length;
	for (var i = 0; i < len; i++) {
		x_data.push((i+1));
	};

	let option = 
		{
			grid: {
	            left: '7%',
           		right: '4%',
           		top: '10%',
           		bottom: '60',
			},
			color:['#175da4'],
			tooltip: {
	            trigger: 'axis',
	            position: function (point, params, dom, rect, size) {
                	return this.bivariate.__tooltip_position(point, params, dom, rect, size);
            	},
	            formatter: function(params){
	                let html = '';
	                html += "<div class='tooltip'>";
	                html += "<span class='blue_labels'>Accumulated varibles:</span>";
	                html += "<span class='f12'>&nbsp;"+params[0].value[0]+"</span>";
	                html += "<p class='blue_labels'>These variables have the " + params[0].seriesName + " lower than:</p>";
	                html += "<div>";
	                html += "<table>";
                    html += "<tr>";
                    html += "<td class='blue_labels'>";
                    html += '<span class="element" style="color:'+params[0].color+'">&#x25b0;</span> ';
                    html += '<span class="i">'+params[0].seriesName+':</span></td>';
                    html += "<td class='right value'>";
                    html += fmt_dec_max3.format(params[0].value[1])+'</td>';
                    html += "</tr>";
	                html += "</table>";
	                html += "<p class='blue_labels'><span class='blue_labels' style='color:"+color.orange+"'>"
                    html += "&#x002D &#x002D &#x002D</span> Warning's threshold(s)</p>";
                    html += "<p class='blue_labels'><span class='element' style='opacity: 0.2; color:"+color.orange+"'>"
                    html += "&#x25b0</span> Warning's area(s)</p>";
	                html += "</div>";
	                return html;
	            },
	            extraCssText: ec_tooltip,
	        },
		 	xAxis: {
			  	type: 'value',
			  	axisLabel: {color:this.color_custom.axisLabelColor,fontSize: 11,},
				axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
				splitLine: {show: false,lineStyle: {color: '#455678'}},
				max: len,
			},
			yAxis: {
				type: 'value',
				axisLabel: {color:this.color_custom.axisLabelColor,fontSize: 11,},
				axisLine:{lineStyle: {color: this.color_custom.axisLineColor}},
				splitLine: {show: true,lineStyle: {color: '#455678'}},
			},
			series: [
				{
					name:'IV',
					symbol: 'none',
					data: array_iv.map(function(value, idx){return [x_data[idx], value]}),
					type: 'line',
					areaStyle: {color: color.sky_blue, opacity: 0.6},
				},
				{
					name:'IV',
					symbol: 'none',
					data: [
						[0.0,parameters["block_data"]["data"][parameters["block_data"]["index"].indexOf("max iv")]],
						[len,parameters["block_data"]["data"][parameters["block_data"]["index"].indexOf("max iv")]]
						],
					type: 'line',
					lineStyle: {
						color: color.orange,
						width: 1,
						type:"dashed"
					},
					areaStyle:{color: color.orange, opacity: 0.2,origin:"end"},
				},
				{
					name:'IV',
					symbol: 'none',
					data: [
						[0.0,parameters["block_data"]["data"][parameters["block_data"]["index"].indexOf("min iv")]],
						[len,parameters["block_data"]["data"][parameters["block_data"]["index"].indexOf("min iv")]]
						],
					type: 'line',
					lineStyle: {
						color: color.orange,
						width: 1,
						type:"dashed"
					},
					areaStyle: {color: color.orange, opacity: 0.2},
				},
				{
			    	name:'Gini',
			    	symbol: 'none',
					data: array_gini.map(function(value, idx){return [x_data[idx], value]}),
					type: 'line',
					areaStyle: {color: color.sky_blue, opacity: 0.6},
				},
				{
					name:'Gini',
					symbol: 'none',
					data: [
						[0.0,parameters["block_data"]["data"][parameters["block_data"]["index"].indexOf("max gini")]],
						[len,parameters["block_data"]["data"][parameters["block_data"]["index"].indexOf("max gini")]]
						],
					type: 'line',
					lineStyle: {
						color: color.orange,
						width: 1,
						type:"dashed"
					},
					areaStyle:{color: color.orange, opacity: 0.2,origin:"end"}
				},
				{
					name:'Gini',
					symbol: 'none',
					data: [
						[0.0,parameters["block_data"]["data"][parameters["block_data"]["index"].indexOf("min gini")]],
						[len,parameters["block_data"]["data"][parameters["block_data"]["index"].indexOf("min gini")]]
						],
					type: 'line',
					lineStyle: {
						color: color.orange,
						width: 1,
						type:"dashed"
					},
					areaStyle: {color: color.orange, opacity: 0.2},
				},
				{
					name: 'Chi2 p-value',
					symbol: 'none',
					data: array_chi2.map(function(value, idx){return [x_data[idx], value]}),
					type: 'line',
					areaStyle: {color: color.sky_blue, opacity: 0.6},
				},
				{
					name:'Chi2 p-value',
					symbol: 'none',
					data: [
						[0.0,parameters["block_data"]["data"][parameters["block_data"]["index"].indexOf("max p-value chi2")]],
						[len,parameters["block_data"]["data"][parameters["block_data"]["index"].indexOf("max p-value chi2")]]
						],
					type: 'line',
					lineStyle: {
						color: color.orange,
						width: 1,
						type:"dashed"
					},
					areaStyle:{color: color.orange, opacity: 0.2,origin:"end"}
				},
				{
					name: 'Max. chi2 p-value pairwise',
					symbol: 'none',
					data: array_chi2max.map(function(value, idx){return [x_data[idx], value]}),
					type: 'line',
					areaStyle: {color: color.sky_blue, opacity: 0.6},
				},
				{
					name: 'Cramer-V',
					symbol: 'none',
					data: array_cramer_v.map(function(value, idx){return [x_data[idx], value]}),
					type: 'line',
					areaStyle: {color: color.sky_blue, opacity: 0.6},
				},
				{
					name:'Cramer-V',
					symbol: 'none',
					data: [
						[0.0,parameters["block_data"]["data"][parameters["block_data"]["index"].indexOf("min cramer v")]],
						[len,parameters["block_data"]["data"][parameters["block_data"]["index"].indexOf("min cramer v")]]
						],
					type: 'line',
					lineStyle: {
						color: color.orange,
						width: 1,
						type:"dashed"
					},
					areaStyle: {color: color.orange, opacity: 0.2},
				}
			],
			legend:{
				inactiveColor:'#57698c',
				symbolKeepAspect:true,itemHeight:11,itemWidth:13,
		        icon:'rect', bottom:'0',
		        textStyle: {
		            padding:[2, 4, 0, -3],
		            align:'left',
		            color: '#8999b9',
		            fontSize: 11,
		        },
				selected: {
				    'IV':(selected==0 ? true : false),
				    'Gini':(selected==1 ? true : false),
				    'Chi2 p-value':(selected==2 ? true : false),
				    'Max. chi2 p-value pairwise':(selected==3 ? true : false),
				    'Cramer-V':(selected==4 ? true : false),
				},
		        itemGap:3,
			    data: ['IV','Gini','Chi2 p-value','Max. chi2 p-value pairwise','Cramer-V'],
			    selectedMode: 'single',
			    color: color['red_dark'],
			}
			      
		};
		return option;
};
bivariate.__global_action_table = function (tables_data) {

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
            case "after bivariate":
                //html += '<tr><td class = "icon_check color_ok">&nbsp;<span class="grey">' + "kept" + '</td><td class="color_ok" style="font-weight: bold;">' + vars_values[i] + '</td></tr>';
                break;
            case "removed":
                html += '<tr><td class = "icon_cross color_rm">&nbsp;<span class="grey">' + column_names[i] + '</td><td class="color_rm" style="font-weight: bold;">' + vars_values[i] + '</td></tr>';
                break;
            case "transformed":
                html += '<tr><td class = "icon_tool color_tr">&nbsp;<span class="grey">' + column_names[i] + '</td><td class="color_tr" style="font-weight: bold;">' + vars_values[i] + '</td></tr>';
                break;
            case "warnings":
                html += '<tr><td><span class = "icon_tool color_tr">&nbsp;<span class="grey">' + column_names[i] + '</td><td class="color_tr" style="font-weight: bold;">' + vars_values[i] + '</td></tr>';
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

bivariate.__global_left_sidebar_output_data = function (samples_info,variables_info) {
    let samples_output=samples_info.data[samples_info.index.indexOf('samples')];
    let variables_output=variables_info.data[variables_info.index.indexOf('after bivariate')];    
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

bivariate.__global_actions = function(tables_data){
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



bivariate.__gs_sidebar_1_datatypes = function (tables_data) {
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

bivariate.__gs_sidebar_1_findings = function (tables_data) {
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

bivariate.__gs_sidebar_1_actions = function(tables_data){
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

bivariate.step_process_custom = function(item,step_id) {
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

    function step_contents_block_data(obj, value_step_id, value_content_type, value_block_type,optional_index){
    	if (optional_index === undefined) {
        	optional_index = 0;
    	}
        return obj["item_steps"].filter(function(value){
            return (value["step_id"] == value_step_id)? true: false;
        })[0]["step_contents"].filter(function(value){
            return (value["type"] == value_content_type)? true: false;
        })[0]["content_blocks"].filter(function(value){
            return (value["type"] == value_block_type)? true: false;
        })[optional_index]
    }


	if (step_id!='00') return null;

	// Constant indexes to access data
	let ind_IV = 5
	let ind_gini = 6
	let ind_chi2 = 12
	let ind_chi2_max = 13
	let ind_cramer_v = 14
	let ind_action = 2

	let ind_type = 1

	let ind_step = '01'
	let ind_contents = '2'
	let ind_contents_blocks = 0

	


	// Prepare vectors
	let num_variables = item.steps['01'].contents['2'].content_blocks[0].block_data.data.length

	let array_iv = []
	let array_gini = []
	let array_chi2 = []
	let array_chi2max = []
	let array_cramer_v = []
	

	// keep , Warning, Remove
	let actions_count = [0,0,0]

	data_vars = item.steps[ind_step].contents[ind_contents].content_blocks[ind_contents_blocks].block_data.data

	for (let i = 0; i < num_variables; i++) {
		// Graphs
		array_iv.push(data_vars[i][ind_IV])
		array_gini.push(data_vars[i][ind_gini])
		array_chi2.push(data_vars[i][ind_chi2])
		array_chi2max.push(data_vars[i][ind_chi2_max])
		array_cramer_v.push(data_vars[i][ind_cramer_v])



		if (item.steps[ind_step].contents[ind_contents].content_blocks[ind_contents_blocks].block_data.data[i][ind_action] == 'keep'){
			actions_count[0] += 1
		} else if (item.steps[ind_step].contents[ind_contents].content_blocks[ind_contents_blocks].block_data.data[i][ind_action] == 'warning') {
			actions_count[1] += 1
		} else {
			actions_count[2] += 1
		}

	}
	array_iv.sort(function(a, b){return a-b})
	array_gini.sort(function(a, b){return a-b})
	array_chi2.sort(function(a, b){return a-b})
	array_chi2max.sort(function(a, b){return a-b})
	array_cramer_v.sort(function(a, b){return a-b})

	

	let step = item.steps[step_id];

	// console.log('Conteo de acciones')
	// console.log(actions_count)
	// console.log('FIN - Conteo de acciones')

	// CHARTS
	let scope = {};
	let json = item.data


    let exists_apply = json["item_steps"].some(function(value){
        return ( value["step_type"] == "transform" || value["step_type"] == "apply" );});
    let version = json.item_layout_version;

    parameters = step_contents_data(json,"01", "parameters", "parameters")
	let chart_stats_options=this.__chart_stats_get_options(0,array_iv,array_gini,array_chi2,array_chi2max,array_cramer_v, parameters);
	let chart_stats= this.echarts_prepare_chart(chart_stats_options,scope);

	let chart_stats_num_options=this.__chart_stats_get_options(1,array_iv,array_gini,array_chi2,array_chi2max,array_cramer_v, parameters);
	let chart_stats_num= this.echarts_prepare_chart(chart_stats_num_options,scope);
	
	let chart_cpu_time = this.__chart_cpu_time(step_contents_block_data(json, "01", "stats", "cpu_time",1)["block_data"])

	let chart_apply_summary
	if (exists_apply){
		chart_apply_summary = this.__chart_apply_summary(step_contents_block_data(json, "02", "summary", "table")["block_data"]);
	}

	let charts_warns_by_type = this.__chart_warns_by_type(step_contents_block_data(json, "01", "summary", "table")["block_data"]);	
	let charts_warns_agg = this.__chart_warns_agg(step_contents_block_data(json, "01", "summary", "table")["block_data"])
    

	let chart_warns_by_type_1 = charts_warns_by_type[0]
	//let chart_warns_by_type_2 = charts_warns_by_type[1]

	// HTML
	let html_cpu_time = step_contents_block_data(json, "01", "stats", "cpu_time")["block_data"];
    html_cpu_time = html_cpu_time["data"][html_cpu_time["index"].indexOf("total")];


    //let html_left_sidebar_column_analysis = this.__global_left_sidebar(step_contents_block_data(json, "01", "stats", "column_analysis"),false, 0, 999);
    //let html_left_sidebar_results = this.__global_left_sidebar(step_contents_block_data(json, "02", "stats", "results"),true, 0);

    //let html_left_sidebar_results = this.__global_action_table(step_contents_block_data(json, "02", "stats", "results"));
	let left_sidebar_04 
	if (exists_apply){
		left_sidebar_04 = this.__global_left_sidebar_output_data(
	    		step_contents_block_data(json, "01", "stats", "db_info_expanded").block_data,
	            step_contents_block_data(json, "02", "stats", "results").block_data);
	}

    //let recommended_actions = this.__global_actions(step_contents_data(json, "01", "summary", "table")["content_blocks"]);

    let sidebar_1_datatypes, sidebar_1_findings,sidebar_1_actions;
    let sidebar_2_actions;
    let apply_summary_transform;

    left_sidebar_01 = this.__global_left_sidebar_01(step_contents_block_data(json, "01", "stats", "db_info_expanded"),false, 2);
    sidebar_1_datatypes = this.__gs_sidebar_1_datatypes(step_contents_data(json, "01", "summary", "table")["block_data"]);
    sidebar_1_findings = this.__gs_sidebar_1_findings(step_contents_data(json, "01", "stats", "column_analysis")["block_data"]);
    sidebar_1_actions = this.__gs_sidebar_1_actions(step_contents_data(json, "01", "summary", "table")["block_data"]);

    if (exists_apply){
		sidebar_2_actions = this.__gs_sidebar_2_actions(step_contents_data(json, "02", "summary", "table")["block_data"]);
	}

	//step.graphs.push(chart_cpu_time)
	if (exists_apply){
		step.graphs.push(chart_apply_summary)
	}
	step.graphs.push(chart_warns_by_type_1)
	//step.graphs.push(chart_warns_by_type_2)
	step.graphs.push(chart_stats)
	//step.graphs.push(chart_stats_num)
	step.graphs.push(charts_warns_agg)
	

   	step.html += '<div class="pos_sidebar_left">';
    step.html += '<div class="element dashed input">';  
    step.html += '<div><h1 class="title">Input</h1></div>';
    step.html += left_sidebar_01;
    step.html += '</div>';


    let step_css_class='';
    if(exists_apply) step_css_class='chain';
    step.html += '<div class="element process_step '+step_css_class+'">';  
    step.html += '<div><h1 class="title">1. Analysis step</h1></div>';   
    step.html += '<div><h1 class="subtitle">Variable datatypes:</h1></div>';
    step.html += sidebar_1_datatypes; 
    step.html += '<details>';
    step.html += '<summary>';
    step.html += '<div><h1 class="subtitle">Findings:</h1></div>';
    step.html += '</summary>';
    step.html += sidebar_1_findings;    
    step.html += '</details>';
    step.html += '<div><h1 class="subtitle">Recommended actions:</h1></div>';
    step.html += sidebar_1_actions;      
    step.html += '<div class="block">' + '<h1 class="block_subtitle">' + 'Process time: ';
    step.html += '<span class="block_title_extra">' + html_cpu_time.toFixed(2) + 's</span>' +'</h1>';
    step.html += '</div>';
    step.html += '</div>';

    if(exists_apply){
        step.html += '<div class="element process_step">';          
        step.html += '<div><h1 class="title">2. Transform step</h1></div>';   
        step.html += '<div><h1 class="subtitle">Applied actions:</h1></div>';        
    	//step.html += html_left_sidebar_results;
    	step.html += sidebar_2_actions;      
        step.html += '<div class="block">';
        step.html += '<h1 class="subtitle">' + 'by datatype: ' + '</h1>';
        step.html += '<div class="echart_chart" style="width:calc(100% - 20px);height: 80px;" id="' + chart_apply_summary.html_element_id + '"></div>';
        step.html += '<h1 class="block_subtitle">' + 'Process time: ';
        step.html += '<span class="block_title_extra">' + html_cpu_time.toFixed(2) + 's</span>' + '</h1>';
        step.html += '</div>';
        step.html += '</div>';        

        step.html += '<div class="element dashed output">';  
        step.html += '<div><h1 class="title">Output</h1></div>';
        step.html += left_sidebar_04;
        step.html += '</div>';
    }
    step.html += '</div>';

    step.html += '<div class="pos_mainbody">';
    step.html += '<div class="row12">';
    step.html += '<div class="row121">';
    step.html += '<div><h1 class="global_subtitle">Metric Warnings</h1></div>';
    step.html += '<div class="echart_chart" style="padding: 0px 10px;" id="' + chart_warns_by_type_1.html_element_id + '"></div>';
    step.html += '</div>';
    step.html += '<div class="row122">';
    step.html += '<div><h1 class="global_subtitle">Cumulative distributions:</h1></div>';
    step.html += '<div class="echart_chart" style="padding:15px 0px 25px 0px;" id="' + chart_stats.html_element_id + '"></div>';
    step.html += '</div>'
    step.html += '</div>'
    //step.html += '<div class="row21">';
    //step.html += '<h1 class="subtitle">Specific warnings for numerical & ordinal variables</h1>';
    //step.html += '<div class="echart_chart" style="padding: 0px 10px;" id="' + chart_warns_by_type_2.html_element_id + '"></div>';
    //step.html += '</div>';
    step.html += '<div class="row22">';
    step.html += '<div><h1 class="global_subtitle">Aggregated Warnings</h1></div>';
    step.html += '<div class="echart_chart" style="padding: 0px 100px;" id="' + charts_warns_agg.html_element_id + '"></div>';
    
    //step.html += '<div></div>';
    //step.html += '<h1 class="global_subtitle">Cummulative distributions:</h1>';
    //step.html += '<div class="echart_chart" style="padding: 15px 0px 35px 0px;" id="' + chart_stats_num.html_element_id + '"></div>';
    step.html += '</div>';
    step.html += '</div>';

    step.html += '</div>';
    step.html += '</div>';

	step.status='processed';

    let custom_class = 'bivariate_general_summary';
    step.html='<div class="step '+custom_class+'">'+step.html+'</div>';  

	return step;
}