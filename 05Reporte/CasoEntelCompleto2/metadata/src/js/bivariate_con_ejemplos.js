var bivariate = new GRMlab();

//---------------------------------------------------------------------------
bivariate.assign_field_renderer_custom = function(field_name,scope,data_type) {
	let renderer = new Object();
	renderer.name='';
	renderer.class='';
	renderer.format_number = '';
	renderer.color_map = new color_mapper({type:null});

	switch (field_name) {
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
		case '_woe':
			renderer.name='woe';
			renderer.format_number = fmt_dec_3;
			renderer.width_factor = 0.54;
			renderer.color_map = new color_mapper({
				type : 'numeric',
				data_list : [null],
				color_list : ['white_9']
			});
			break;
		case 'woe':
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
			renderer= new field_renderer({
				type:'bar',
				data_type:data_type,
				value_position:'right',
				value_align:'right',
				value_format:fmt_dec_3,
				value_max:1,
				value_color_map:'',
				bar_color_map:'',
				bar_width:'35px',
				/* example
				init_renderer : function(table_data,column_positions) {
					console.log(table_data);
					console.log(column_positions);
					let column_index=column_positions['iv'];
					let value_max=table_data[0][column_index];
					for (let i = 1; i < table_data.length; i++) {
						if (table_data[i][column_index]>value_max) {
							value_max=table_data[i][column_index];
						}
					}
					this.value_max=value_max;
					console.log('=====');
					console.log(this.value_max);
				},*/
			});
			break;
	}
	if (renderer.name=='') return null;
	else return renderer;
}

//---------------------------------------------------------------------------
bivariate.modal_boxes_prepare_html =  function(json) {
	console.log(json);

	// Initialize
	// -------------------------------------------------------------------------
	let results = {html:'',graphs: [],datatables: [],content_class:''};
	let v_data = json.data;
	// Todo: get scope from json item_id step_id, include the list en model (MVC);
	let scope = {
					item_type:'bivariate',
					step_type:'analysis',
					place_type:'modal'
		};

	// Basic functions;
	// -------------------------------------------------------------------------
	// Method override example (deep)
	//this.modal_boxes_html_title = function(v_data) {
	//	let html = '';
	//	html +='<h1 class="modal_title">Bivariate:'+v_data.name;
	//	html +='<span class="italic grey"> ('+v_data.type+')</span>';
	//	html +='</h1>';
	//	return html;
	//}

	// Prepare data
	// -------------------------------------------------------------------------
	let box_title  = this.modal_boxes_html_title(v_data);
	let table_basic  = this.datatables_prepare_datatable(v_data.basic_binning_table,scope);
	let table_optimal= this.datatables_prepare_datatable(v_data.optimal_binning_table,scope);

	// Template
	// -------------------------------------------------------------------------
	let html = '';
	html += '<div>';
	html += box_title;
	html += '</div>';
	// -------------------------------------------------------------------------

	// Prepare results
	// -------------------------------------------------------------------------
	results.content_class = 'modal_bivariate';
	results.datatables.push(table_basic);
	results.datatables.push(table_optimal);
	results.html = html;
	return results;
}

//---------------------------------------------------------------------------


