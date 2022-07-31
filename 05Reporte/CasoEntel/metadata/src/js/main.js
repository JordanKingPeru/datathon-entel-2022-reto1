'use strict';

// -----------------------------------------------------------------------------
// Global variables
// -----------------------------------------------------------------------------
const color = {
	BP_600: '#121212',
	BP_500: '#666666',
	BP_400: '#BDBDBD',
	BP_300: '#D3D3D3',
	BP_200: '#E9E9E9',
	BP_100: '#F4F4F4',
	white: '#FFFFFF',

	navy: '#072146',
	core_blue: '#004481',
	core_blue_dark: '#043263',
	core_blue_light: '#1464A5',
	medium_blue: '#1973B8',
	medium_blue_light: '#49A5E6',
	sky_blue: '#5BBEFF',
	sky_blue_light: '#D4EDFC',

	aqua: '#2DCCCD',
	aqua_dark: '#028484',
	aqua_medium: '#02A5A5',
	aqua_light: '#5AC4C4',
	aqua_white: '#EAF9FA',

	red: '#DA3851',
	red_dark: '#B92A45',
	red_medium: '#C0475E',
	red_light: '#E77D8E',
	red_white: '#F4C3CA',

	yellow: '#F8CD51',
	yellow_dark: '#9C6C01',
	yellow_medium: '#C49735',
	yellow_light: '#FADE8E',
	yellow_white: '#FADE8E',

	coral: '#F35E61',
	coral_dark: '#CB353A',
	coral_medium: '#D44B50',
	coral_light: '#F59799',
	coral_white: '#FCDFDF',

	pink: '#F78BE8',
	pink_dark: '#AD53A1',
	pink_medium: '#C569B9',
	pink_light: '#FAB3F0',
	pink_white: '#FDDCF8',

	orange: '#F7893B',
	orange_dark: '#C65302',
	orange_medium: '#D8732C',
	orange_light: '#FAB27F',
	orange_white: '#FDE7D8',

	sand: '#D8BE75',
	sand_dark: '#8E7022',
	sand_medium: '#B79E5E',
	sand_light: '#E6D5A5',
	sand_white: '#F3EBD5',

	green: '#48AE64',
	green_dark: '#277A3E',
	green_medium: '#388D4F',
	green_light: '#88CA9A',
	green_white: '#D9EFE0',

	purple: '#8F7AE5',
	purple_dark: '#6754B8',
	purple_medium: '#7C6AC7',
	purple_light: '#B6A8EE',
	purple_white: '#DDD7F7',
};

// Standard formats
var fmt_num_basic = new Intl.NumberFormat('en-US');

var fmt_pct = new Intl.NumberFormat(
	'en-US', {
		style: "percent",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}
);

var fmt_pct_1_1 = new Intl.NumberFormat(
	'en-US', {
		style: "percent",
		minimumFractionDigits: 1,
		maximumFractionDigits: 1
	}
);

var fmt_pct_2_2 = new Intl.NumberFormat('en-US', {
	style: "percent",
	minimumFractionDigits: 2,
	maximumFractionDigits: 2
});

var fmt_pct_0_2 = new Intl.NumberFormat('en-US', {
	style: "percent",
	minimumFractionDigits: 0,
	maximumFractionDigits: 2
});

var fmt_pct_3_1 = new Intl.NumberFormat('en-US', {
	style: "percent",
	minimumIntegerDigits: 3,
	minimumFractionDigits: 1,
	maximumFractionDigits: 1
});

var fmt_dec_1 = new Intl.NumberFormat('en-US', {
	minimumFractionDigits: 1,
	maximumFractionDigits: 1
});

var fmt_dec_2 = new Intl.NumberFormat('en-US', {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2
});

var fmt_dec_3 = new Intl.NumberFormat('en-US', {
	minimumFractionDigits: 3,
	maximumFractionDigits: 3
});

var fmt_dec_5 = new Intl.NumberFormat('en-US', {
	minimumFractionDigits: 5,
	maximumFractionDigits: 5
});

var fmt_dec_max1 = new Intl.NumberFormat('en-US', {
	minimumFractionDigits: 0,
	maximumFractionDigits: 1
});

var fmt_dec_max2 = new Intl.NumberFormat('en-US', {
	minimumFractionDigits: 0,
	maximumFractionDigits: 2
});

var fmt_dec_max3 = new Intl.NumberFormat('en-US', {
	minimumFractionDigits: 0,
	maximumFractionDigits: 3
});

var fmt_int = new Intl.NumberFormat('en-US', {
	maximumFractionDigits: 0
});

var fmt_int_2 = new Intl.NumberFormat('en-US', {
	maximumFractionDigits: 0,
	minimumIntegerDigits: 2
});

// -----------------------------------------------------------------------------
//  Model
// -----------------------------------------------------------------------------
var model = {
	item_list: [],
	report_info: {},
	selected_item: {elem:null,item_id:null,container_elem:null},
	need_resize: null,
  items_data: {},
  base_core: null,
	core: null,			
  current_assets: {datatables:[],echarts:[]},
	keyboard_disabled:false,
	modal_active:false,
};

// -----------------------------------------------------------------------------
//  View
// -----------------------------------------------------------------------------

// Sidebar
// -----------------------------------------------------------------------------
let sidebarView = {
    init: function() {
    	// Basic init
	    this.tocElem = document.getElementById('toc');
	    this.sidebarCollapseElem = document.getElementById('sidebarCollapse');
	    this.sidebarElem = document.getElementById('sidebar');
	    this.sidebarCollapseElem = document.getElementById('sidebarCollapse');
	    this.contentElem = document.getElementById('content');

		// Events
        this.sidebarCollapseElem.addEventListener('click', function(){
        	sidebarView.change_status();
        });

		document.addEventListener('keyup', function(e) {
			const keyboard_disabled = controller.get_keyboard_disabled();
			const modal_active = controller.get_modal_active();
			// Exit conditions
			if (modal_active==true) return;
			if (keyboard_disabled==true) return;

			controller.set_keyboard_disabled(true);
			if (e.code=="BracketLeft") sidebarView.change_status();
			controller.set_keyboard_disabled(false);
		});

		// On sidebar click:
		this.sidebarElem.addEventListener('click', function(e){
			controller.set_need_resize(false);
			let clicked_element = e.target.parentElement;
			if (clicked_element.tagName == "LI") {
				clicked_element = e.target;
			}
			if (clicked_element.tagName == "A") {
				let clicked_item_id = clicked_element.getAttribute('href').substr(1);
				let current = controller.get_selected_item();
				maincontView.resizeObserver.disconnect();

				// If the target is the same, return
				if (clicked_item_id == current.item_id) return;

				if (current.elem != null) {
					sidebarView.toggle_active(current.elem);
				}
				if (current.item_id == 'frontpage') {
					window.pJSDom[0].pJS.particles.move.enable = false;
					elem_particles.style.display = "none";
				}

				sidebarView.toggle_active(clicked_element);

				// TODO: implement and call controller change item;
				elem_loading.style.opacity=1;
				current.container_elem.style.display = 'none';
				controller.set_selected_item(clicked_element,clicked_item_id);
				//change_item(clicked_item_id);
				setTimeout(function() {change_item(clicked_item_id);}, 25);
			}
		});

		// Content
    	this.html=this.prepare_html(controller.get_item_list());
    },

    toggle_active: function(element) {
   		element.classList.toggle('active');
   		// Toggle main item
   		if (element.classList.contains('subitem')) {
   			let main_item=element.parentElement.parentElement.previousSibling;
   			main_item.classList.toggle('active');;
   		}
   		// Toggle first subitem
   		else if (element.classList.contains('no_info')) {
   			let first_subitem=element.nextSibling.firstChild.firstChild;
   			first_subitem.classList.toggle('active');;
   		}
    },

    // Switch status (collapsed/non collapsed)
    change_status: function() {
		this.sidebarCollapseElem.classList.toggle('icon_left');
		this.sidebarCollapseElem.classList.toggle('icon_right');
		this.sidebarElem.classList.toggle('collapsed');
		this.contentElem.classList.toggle('collapsed');
    },

    // Attach html to the DOM element
    render: function() {
        this.tocElem.innerHTML=this.html;
    },

    prepare_html: function(item_list) {
	    let html = [];

		let ol_count=1;
		let count =0;
		let li1_status='';
		let li2_status='';
		let item_style='';
		for (let item of item_list) {
			let item_class ='';
			switch (item.type) {
				case 'preprocessing': item_class='icon_database';break;
				case 'preprocessingdatastream': item_class='icon_database';break;
				case 'univariate': item_class='icon_model';break;
				case 'bivariate': item_class='mult icon_bivariate';break;
				case 'bivariatecontinuous': item_class='mult icon_bivariate';break;
				case 'optimalgrouping': item_class='icon_binning';break;
				case 'modelgenerator': item_class='icon_flask';break;
				case 'modeloptimizer': item_class='icon_optimizer';break;
				case 'modelanalyzer': item_class='icon_analyzer';break;
				case 'prebinning': item_class='icon_binning';break;
				case 'toymodelselection': item_class='icon_model';break;
				default: item_class='icon_default';break;
			}

			let href_id=item.item_id;
			if (item.step_id == '00' && item.item_info==0) href_id+='_'+item.step_id;
			else {
				href_id+='_'+item.step_id;
			}

			if (item.step_id == '00') {
				if (li1_status=='open') {
					html.push('</li>');
					li1_status='closed';
				}
				if (li2_status=='open') {
					html.push('</ol>');
					li2_status='closed';
					ol_count=1;
				}
				item_style=' style="opacity:0;animation: 1.1s ease '+(0.30*(count))+'s fadein forwards;" ';
				html.push('<li class="sidebar_item" '+item_style+'>');
				count+=1;
				if (item.type=='univariate') item_class+='';
				else if (item.type=='preprocessingdatastream') item_class+='';
				else if (item.type=='preprocessing') item_class+='';
				else if (item.type=='bivariate') item_class+='';
				else if (item.type=='bivariatecontinuous') item_class+='';
				else if (item.type=='modeloptimizer') item_class+='';
				else if (item.type=='modelanalyzer') item_class+='';
				else if (item.item_info!=1) item_class+=' no_info';
				html.push('<a class="item '+item_class+'"" href="#'+href_id+'">');
				html.push('<span>'+item.title+"</span></a>");
			}
			else {
				if (li2_status!='open') {
					html.push('<ol>');
					li2_status='open';
					ol_count=1;
				}
				html.push('<li class="sidebar_subitem">');
				count+=0;
				html.push('<a class="subitem"'+' href="#' + href_id + '">');
				html.push( ol_count + '. <span>'+item.title+"</span></a>");
				html.push('</li>');
				ol_count+=1;
			}
		}
		if (li1_status=='open') html.push('</li>');
		if (li2_status=='open') html.push('</ol>');

		return html.join('');
    },
};

// Frontpage
// -----------------------------------------------------------------------------
let frontpageView = {
    init: function() {
    	// Basic init
	    this.frontpage_titleElem = document.getElementById('frontpage_title');

    	// Events

    	// Content
    	this.html=this.prepare_html(controller.get_report_info());
    },
    // Attach html to the DOM element
    render: function() {
        this.frontpage_titleElem.innerHTML=this.html;

		// Particles
		particlesJS("particles-js", {"particles":{"number":{"value":400,"density":{"enable":true,"value_area":800}},"color":{"value":"#ffffff"},"shape":{"type":"circle","stroke":{"width":0,"color":"#000000"},"polygon":{"nb_sides":5},"image":{"src":"img/github.svg","width":100,"height":100}},"opacity":{"value":0.3,"random":false,"anim":{"enable":false,"speed":1,"opacity_min":0.1,"sync":false}},"size":{"value":2,"random":true,"anim":{"enable":false,"speed":40,"size_min":0.1,"sync":false}},"line_linked":{"enable":true,"distance":110,"color":"#ffffff","opacity":0.05,"width":1},"move":{"enable":false,"speed":2.0,"direction":"none","random":false,"straight":false,"out_mode":"out","bounce":false,"attract":{"enable":false,"rotateX":600,"rotateY":1200}}},"interactivity":{"detect_on":"canvas","events":{"onhover":{"enable":false,"mode":"repulse"},"onclick":{"enable":false,"mode":"push"},"resize":true},"modes":{"grab":{"distance":400,"line_linked":{"opacity":1}},"bubble":{"distance":400,"size":40,"duration":2,"opacity":8,"speed":3},"repulse":{"distance":200,"duration":0.4},"push":{"particles_nb":4},"remove":{"particles_nb":2}}},"retina_detect":true});
    },
    prepare_html: function(report_info) {
	    let html = [];

		html.push('<h1>'+report_info['title1']+'</h1>');
		html.push('<h2>'+report_info['title2']+'</h2>');
		html.push('<h3>'+report_info['title3']+'</h3>');
		html.push('<div class="report_details">');
		html.push('<span class="label">User: </span>');
		html.push('<span>'+report_info['user_id']+'</span><br/>');
		html.push('<span class="label">Computer: </span>');
		html.push('<span>'+report_info['user_machine']+'.'+report_info['user_domain']+'</span><br/>');
		html.push('<span class="label">Datetime: </span>');
		html.push('<span>'+report_info['datetime']+'</span>');
		html.push('</div>');

		return html.join('');
    },
};


// Main container
// -----------------------------------------------------------------------------
let maincontView = {
    init: function() {
		// Basic init
	    this.maincontElem = document.getElementById('main_content');

  	// Events

		// Onresize
			this.onResize = function (){
				let current = controller.get_selected_item().item_id;
				if (current == 'frontpage') return;
				let current_item_id=current.split('_')[0];
				if (typeof model.items_data[current_item_id] == 'undefined') return;				

				if (controller.get_need_resize()) {
					let current_step_id=current.split('_')[1];							
					for (var i = 0; i < model.items_data[current_item_id].steps[current_step_id].graphs.length; i++) {
					 	refreshGraphNow(model.items_data[current_item_id].steps[current_step_id].graphs[i]);
					}		 					
				}
				controller.set_need_resize(true);
			}
			this.resizeObserver = new ResizeObserver(this.onResize);

		// Content
    	this.html=this.prepare_html(controller.get_item_list());
    },
    // Attach html to the DOM element
    render: function() {
		this.maincontElem.insertAdjacentHTML('beforeend', this.html);
    },
    prepare_html: function(item_list) {
	    let html = '';
		for (let i = 0; i < item_list.length; i++) {
			// Only create a container if there is information
			//if (item_list[i].step_id != '00' || item_list[i].item_info==1) {
			let href_id=item_list[i].item_id+'_'+item_list[i].step_id;
			//html+='<div class="cont_item" style="width: calc(100% - 40px);opacity:0;left: 0px;top: 0px;pzosition: absolute;display:block;" id="'+href_id+'"></div>';
			html+='<div class="cont_item" style="display:none;" id="'+href_id+'"></div>';
			//}
		}
		return html;
    },
};

// -----------------------------------------------------------------------------
// Controller
// -----------------------------------------------------------------------------
var controller = {

	init: function() {

		// Initialize particles
		document.addEventListener("DOMContentLoaded", function(event) {
			// Animate particles
			console.time('Particles animation');
			seed1=1;seed2=1;seed3=1;
			window.pJSDom[0].pJS.particles.move.enable = true;
			window.pJSDom[0].pJS.fn.vendors.draw();
			console.timeEnd('Particles animation');
		});

		// Initialize the model
		this.set_selected_item(null,'frontpage');

		// Item list from contents.json
		for (let item of json_items) {
			model.item_list.push(JSON.parse(item));
		}

		// Process structure


		// Basic report information contents.json
		let info_1=JSON.parse(report_info);
		let info_2=JSON.parse(user_info);
		model.report_info = Object.assign(model.report_info, info_1,info_2);

		// Init GRMLab object
		model.base_core = new GRMlab();
		model.core = model.base_core;			

		// Initialize views
		sidebarView.init();
		frontpageView.init();
		maincontView.init();

		// Render views
		sidebarView.render();
		frontpageView.render();
		maincontView.render();
	},

	get_item_list: function() {
		return model.item_list;
	},

	get_report_info: function() {
		return model.report_info;
	},

	get_selected_item: function() {
		return model.selected_item;
	},
	set_selected_item: function(elem,item_id) {
		model.selected_item.elem=elem;
		model.selected_item.item_id=item_id;
		model.selected_item.container_elem=document.getElementById(item_id);
	},

	get_keyboard_disabled: function() {
		return model.keyboard_disabled;
	},
	set_keyboard_disabled: function(value) {
		model.keyboard_disabled=value;
	},

	get_modal_active: function() {
		return model.modal_active;
	},
	set_modal_active: function(value) {
		model.modal_active=value;
	},

	get_need_resize: function() {
		return model.need_resize;
	},
	set_need_resize: function(value) {
		model.need_resize=value;
	},

};
// -----------------------------------------------------------------------------

console.time('controller.init()');
controller.init();
console.timeEnd('controller.init()');








// Style
const color_background_1 = '#0a213c';
const ec_tooltip = 'background-color: #0a213c;background-color: rgba(0,0,0,0.1);padding: 0px;border-radius: 5px;';

	// -----------------------------------------------------------------------------------------------------
	function create_step_layout_parts(item) {
		var layout={};
		if (item.data.item_layout_version == '01' || item.data.item_layout_version == '02') {
			layout['header']='';
			layout['sidebar_left']='';
			layout['sidebar_right']='';
			layout['mainbody'] ='';
			layout['footer']='';
		}
		return layout;
	}

	// -----------------------------------------------------------------------------------------------------
	function join_step_layout_parts(item,step_layout_parts) {
		let html='';
		if (item.data.item_layout_version == '01' || item.data.item_layout_version == '02') {
			if (step_layout_parts['header']!='') {
				html+='<div class="pos_header">'+step_layout_parts['header']+'</div>';	
			}
			if (step_layout_parts['sidebar_left']!='') {
				html+='<div class="pos_sidebar_left">'+step_layout_parts['sidebar_left']+'</div>';
			}			
			if (step_layout_parts['mainbody']!='') {
				html+='<div class="pos_mainbody">'+step_layout_parts['mainbody']+'</div>';
			}			
			if (step_layout_parts['sidebar_right']!='') {
				html+='<div class="pos_sidebar_right">'+step_layout_parts['sidebar_right']+'</div>';
			}			
			if (step_layout_parts['footer']!='') {
				html+='<div class="pos_footer">'+step_layout_parts['footer']+'</div>';
			}			
		}
		return html;
	}	

// -----------------------------------------------------------------------------------------------------
// Column renderers;
// -----------------------------------------------------------------------------------------------------
	function render_col_action(row,pos) {
		var val_class='';
		switch (row[pos]) {
			case 'keep': val_class=' class='+'act_ok';break;
			case 'remove': val_class=' class='+'act_rm';break;
			case 'transform': val_class=' class='+'act_tr';break;
			case 'repair': val_class=' class='+'act_tr';break;
			case 'warning': val_class=' class='+'act_warn';break;
			case 'review': val_class=' class='+'act_rvw';break;
		}
		return '<td'+val_class+'>'+row[pos]+'</td>'
	}

	function render_col_action2(row,pos,renderer,columns) {
		let html ='';
		let class_val='';
		switch (row[pos]) {
			case 'keep': 		class_val='ok icon_check';break;
			case 'remove': 		class_val='error icon_cross';break;
			case 'transform': 	class_val='warning icon_tool';break;
			case 'repair': 		class_val='warning icon_tool';break;
		}
		return '<td class="center f0 '+class_val+'"">'+row[pos]+'</td>';
	}

	function render_col_check(row,pos,action) {
		var main_class='';
		var color_class='';
		var cell_content='';
		switch (row[pos]) {
			case true:
			case 1:
				cell_content='&#x25cf;';
				main_class='chk';
				switch (row[action]) {
					case 'keep': color_class='color_blue';break;
					case 'remove': color_class='color_rm';break;
					case 'transform': color_class='color_tr';break;
					case 'repair': color_class='color_tr';break;
				}
				break;
			default:
				return '<td>·</td>';
		}
		return '<td class="'+color_class+' '+main_class+'">'+cell_content+'</td>';
	}

	function render_col_block_number(row,pos,renderer) {
		switch (row[pos]) {
			case -1: return '<td></td>';
		}
		return '<td>'+renderer.format_number.format(row[pos])+'</td>';
	}

	function render_col_raw(row,pos) {
		if (row[pos] === null) row[pos] = '';;
		return '<td>'+row[pos]+'</td>';
	}

	function render_col_comment(row,pos,pos_color,main_style) {
		switch (row[pos_color]) {
			case 'keep': val_class=' class='+'color_ok';break;
			case 'remove': val_class=' class='+'color_rm';break;
			case 'transform': val_class=' class='+'color_tr';break;
			case 'repair': val_class=' class='+'color_tr';break;
		}
		if (row[pos]=='') return '<td style="'+main_style+'"'+'></td>';
		return '<td style="'+main_style+'"'+val_class+'><span data-tocoltip="'+row[pos]+'">'+'<span class="dtc_icon_warning">'+row[pos]+'</span></span></td>'
	}

	function render_col_alert_tooltip(row,pos,pos_color,main_style) {
		switch (row[pos_color]) {
			case 'keep': val_class=' class='+'color_ok';break;
			case 'remove': val_class=' class='+'color_rm';break;
			case 'transform': val_class=' class='+'color_tr';break;
			case 'repair': val_class=' class='+'color_tr';break;
		}
		if (row[pos]=='') return '<td style="'+main_style+'"'+'></td>';
		return '<td style="'+main_style+'"'+val_class+'><div class="tooltip dt_icon_warning"><span class="tooltiptext">'+row[pos]+'</span></div></td>'
	}

	function render_col_case(row,pos,pos_color,main_style) {
		let val_class ='';
		switch (row[pos_color]) {
			case 'keep': val_class=' class='+'';break;
			case 'remove': val_class=' class='+'color_rm';break;
			case 'transform': val_class=' class='+'color_tr';break;
			case 'repair': val_class=' class='+'color_tr';break;
			case 'warning': val_class=' class='+'color_tr';break;
			case 'review': val_class=' class='+'color_tr';break;
		}
		if (row[pos]=='') return '<td style="'+main_style+'"'+'></td>';
		return '<td style="'+main_style+'"'+val_class+'>'+row[pos]+''+'</span></td>'
	}

	function render_col_status(row,pos,pos_color,pos_messages,main_style) {
		let css_class ='';
		switch (row[pos_color]) {
			case 'keep': break;
			case 'remove': css_class+=' color_rm';break;
			case 'transform': css_class+=' color_tr';break;
			case 'repair': css_class+=' color_tr';break;
			case 'warning': css_class+=' color_tr';break;
			case 'review': css_class+=' color_tr';break;
		}
		if (row[pos]=='') return '<td style="'+main_style+'"'+'></td>';
		let list_html='';
		let message_list = row[pos_messages];
		let tooltip='';
		if (message_list == null) {}
		else {
			if (message_list[0].length==1) {
				message_list=[message_list];
			}
			for (let message of message_list) {
				list_html+='<li>'+message+'</li>';
			}
			css_class+=' tooltip';
			tooltip='<span class="tooltiptext"><ol>'+list_html+'</ol></span>';
		}					

		return '<td style="'+main_style+'"><div class="'+css_class+'">'+row[pos]+''+''+tooltip+'</div></td>'
	}

	function render_col_linked_variable(row,pos,row_number,details_id) {
		let var_details_id = details_id+'_'+row[pos];
		return '<td><button row_pos="'+row_number+'" id="'+ var_details_id +'" class="modal_button icon_link">'+row[pos]+'</button></td>'
	}

	function render_col_numeric(row,pos,renderer) {
		var color_class = renderer.color_map.get_color(row[pos],'t_');
		var html ='';
		if (renderer.class || color_class) {
			html = '<td class="'+renderer.class+' '+color_class+'">';
		}
		else html = '<td>';
		html += renderer.format_number.format(row[pos])+'</td>';
		return html;
	}


	function render_col_text(row,pos,renderer,columns) {
		var html ='';
		var value = row[pos] == null ? '' : row[pos];
		html = '<td class="'+renderer.class+'">';
		html += value+'</td>';
		return html;
	}


	function render_col_action_plus(row,pos,renderer,columns) {
		let class_val='';
		let html ='';
		let comment = row[columns[renderer.comment_column]];
		switch (row[pos]) {
			case 'keep': 		class_val='ok icon_check';break;
			case 'remove': 		class_val='error icon_cross';break;
			case 'transform': 	class_val='warning icon_tool';break;
			case 'repair': 		class_val='warning icon_tool';break;
		}
		if (comment != '') {
			comment=' <div class="tooltip icon_comment">2<span class="tooltiptext">'+comment+'</span></div>';
		}
		return '<td class="center '+class_val+'"">'+row[pos]+comment+'</td>';
	}

	function render_col_comment2(row,pos,renderer,columns) {
		let comment_list = row[pos];
		if (comment_list === null) return '<td></td>';;
		let comment_list_len = comment_list.length;

		if (comment_list_len == 0 ) return '<td></td>';;

		// Sometimes there is no array: FixMe (preprocess apply - python);
		if (comment_list[0].length==1) {
			comment_list=[comment_list];
			comment_list_len=1;
		}

		let html ='';
		let list_html ='';
		let class_val='';
		for (let comment of comment_list) {
			list_html+='<li>'+comment+'</li>';
		}

		html += '<td class="'+renderer.class+'"">';
		html += '<div class="tooltip icon_comment">';
		html += (comment_list_len>1 ? comment_list_len : '') + ' ';
		html += '<span class="tooltiptext"><ol>'+list_html+'</ol></span></div></td>';
		return html;
	}

	function render_col_action_tooltip(row,pos,renderer,columns) {
		let html ='';		
		let val_class ='';
		let importance_level = (typeof renderer.importance_level != 'undefined') ? renderer.importance_level : '';
		let tooltip = (typeof renderer.tooltip != 'undefined') ? renderer.tooltip : '';
		
		switch (row[pos]) {
			case 'keep': val_class='act_ok';break;
			case 'remove': val_class='act_rm';break;
			case 'transform': val_class='act_tr';break;
			case 'repair': val_class='act_tr';break;
			case 'warning': val_class='act_warn';break;
			case 'review': val_class='act_review';break;
		}
		let color_class;
		switch (row[pos]) {
			case 'keep': color_class='color_ok';break;
			case 'remove': color_class='color_rm';break;
			case 'transform': color_class='color_tr';break;
			case 'repair': color_class='color_tr';break;
			case 'warning': color_class='color_tr';break;
			case 'review': color_class='color_tr';break;
		}
		val_class+=' '+importance_level;
		val_class+=' '+tooltip;

		let comment_list = row[columns[renderer.comment_col]];
		if (comment_list === null) {
			html += '<td class="center '+''+' '+renderer.class+'"">';
			html += '<div class="tooltip '+val_class+' '+color_class+'">';
			html += '<span class="f11 tooltiptext"><span class="b f13 '+color_class+'">'+row[pos]+'</span></span></div></td>';
			return html;
		}
		let comment_list_len = 0;
		if (typeof comment_list != 'undefined') comment_list_len=comment_list.length;

		if (comment_list_len == 0 ) {
			html += '<td class="center '+''+' '+renderer.class+'"">';
			html += '<div class="tooltip '+val_class+' '+color_class+'">';
			html += '<span class="f11 tooltiptext"><span class="b f13 '+color_class+'">'+row[pos]+'</span></span></div></td>';
			return html;			
		}

		// Sometimes there is no array: FixMe (preprocess apply - python);
		if (comment_list[0].length==1) {
			comment_list=[comment_list];
			comment_list_len=1;
		}

		let list_html ='';
		let class_val='';
		for (let comment of comment_list) {
			list_html+='<li>'+comment+'</li>';
		}

		html += '<td class="center '+''+' '+renderer.class+'"">';
		html += '<div class="tooltip '+val_class+' '+color_class+'">';
		html += '<span class="f11 tooltiptext"><span class="b f13 '+color_class+'">'+row[pos]+' </span><ol style="margin-top:5px;">'+list_html+'</ol></span></div></td>';
		return html;
	}

	function render_col_numeric_num_pct(row,pos,renderer,columns) {
		let html ='';
		let color_class = '';
		let value =row[columns[renderer.pct_column]];
		if (typeof renderer.color_map != "undefined") {
			color_class = renderer.color_map.get_color(value,'t_');
		}
		html+='<td class="center">';
		html+='<span style="display: none;">';
		html+=fmt_pct_3_1.format(value);
		html+='</span>';
		html+='<span class="col_num_pct_left '+color_class+'">';
		html+= fmt_pct_1_1.format(value);
		html+='</span>';
		html+='<span class="col_num_pct_right">(';
		html+=renderer.format_number.format(row[pos]);
		html+=')</span>';
		html+='</td>';
		return html;
	}

	function render_col_pct_label(row,pos,renderer,columns) {
		let html ='';
		let color_class = '';
		let value =row[pos];
		let label =row[columns[renderer.label_column]];

		if (typeof renderer.color_map != "undefined") {
			color_class = renderer.color_map.get_color(value,'t_');
		}
		html+='<td class="center">';
		html+='<span style="display: none;">';
		html+=fmt_pct_3_1.format(value);
		html+='</span>';
		html+='<span class="col_num_pct_left '+color_class+'">';
		html+=renderer.format_number.format(value);
		html+='</span>';
		html+='<span class="col_num_pct_right">';;
		if (label.length > renderer.label_max_length) {
			html+='(<span basic-tooltip="'+label+'">';
			html+=label.substr(0,renderer.label_max_length)+'...</span>)';
			//html+='('+label.substr(0,renderer.label_max_length)+'...)';
		}
		else html+="('"+label+"')";
		html+='</span>';
		html+= '</td>';
		return html;
	}

	function render_col_string(row,pos,renderer,columns) {
		let html ='';
		let value =row[pos];
		// TODO: FIXME
		if (row[pos] == 'recursive_feature_elimination') value='RFE';

		html+='<td class="'+renderer.class+'" style="'+renderer.style+'">';

		if (value.length > renderer.max_length && renderer.tooltip==false) {
			html+='<span>';
			html+=value.substr(0,renderer.max_length);
			html+='</span>';
		}
		else if (value.length > renderer.max_length) {
			var tooltip_html = '';
			var elements = value.split(", ");
			tooltip_html+='<div class="tooltip"><span class="tooltiptext_optbin">';
			tooltip_html+='<table>';
			var current_length=0;
			var tr_status='closed';
			for (var i = 0; i < elements.length; i++) {
				if (tr_status=='closed') {
					tooltip_html+='<tr>';
					tr_status='open';
				}
				current_length+=elements[i].length;
				tooltip_html+='<td>';
				tooltip_html+=elements[i]+'<span class="blue_labels"> , </span>';
				tooltip_html+='</td>';
				if (current_length>39) {
					tooltip_html+='</tr>';
					tr_status='closed';
					current_length=0;
				}
			}
			if (tr_status=='open') tooltip_html+='</tr>';
			tooltip_html+='</table></span>';
			html+='<span style="cursor: default;">';
			html+=tooltip_html;
			//html+='<span basic-tooltip="'+tooltip_html+'">';
			html+=value.substr(0,renderer.max_length)+'...</span></div>';
			//html+='('+label.substr(0,renderer.label_max_length)+'...)';
		}
		else {
			html+='<span>';
			html+=""+value+"";
			html+='</span>';
		}
		html+= '</td>';
		return html;
	}

	function render_col_max(row,pos,renderer,columns) {
		let html ='';
		let input_values = [];

		for (let i = 0; i < renderer.input_columns.length; i++) {
		//for (let input_column of renderer.input_columns) {
			input_values.push(row[columns[renderer.input_columns[i]]]);
		}
		let max =  Math.max.apply(Math, input_values);
		max = renderer.format_number.format(max);
		let color_class = '';
		if (typeof renderer.color_map != "undefined") {
			color_class=renderer.color_map.get_color(max,'t_');
		}

		html+='<td class="center">';
		html+='<span style="display: none;">'+max+'</span>';
		html+='<span class="col_num_pct_left '+color_class+'">'+max+'</span>';
		html+= '</td>';
		return html;
	}

	function render_col_squares(row,pos,renderer) {
		var html = '';
		var color_class = renderer.color_map.get_color(row[pos],'t_');
		var max = renderer.max_squares;

		html+='<td>';
		if (max!=1) {
			var count = Math.min(row[pos],max);
			html+='<span style="display: none;">'+fmt_int_2.format(row[pos])+'</span>';
			html+='<span class="square_number '+color_class+'"">'+row[pos]+'</span>';
			html+='<span class="square_filled">'+"&#9611;".repeat(count)+'</span>';
			html+='<span class="square_empty">'+"&#9611;".repeat(max-count)+'</span>';
		}
		else {
			html+='<span style="display: none;">'+row[pos]+'</span>';
			if (row[pos]==1)
				html+='<span class="square_filled white">&#9611;</span>';
			else
				html+='<span class="square_empty">&#9611;</span>';
		}
		html+='</td>';
		return html;
	}

	function render_col_colorbox(row,row_number,pos,renderer,columns) {
		var html = '';
		html+='<td class="" style="padding-left:0px;text-align:center;color:#0b1c33;background-color:'+row[pos]+';">'+(row_number+1)+'</td> ';
		return html;
	}



	function render_col_iv_old(row,pos,renderer,columns) {
		var html = '';
		// TODO
		if (typeof renderer.color_column != "undefined") {
			var color = row[columns[renderer.color_column]];
			html='<td class="left">';
			if (renderer.width_factor*row[pos]>1.1) {
				html+='<span class="bar" style="background-color:'+color+';margin: 6px 1px;width:'+ Math.min(55,eval((row[pos]*55*renderer.width_factor)+2)) +'px"></span>';
				html+='<span class="bar" style="background-color:'+color+';width:1px;margin: 6px 1px;"></span>';
				html+='<span class="bar" style="background-color:'+color+';width:1px;margin: 6px 1px 6px 0px;"></span>';
				html+='<span class="bar" style="background-color:'+color+';width:10px;margin: 6px 4px 6px 1px;"></span>';
			}
			else {
				html+='<span class="bar" style="background-color:'+color+';width:'+ Math.min(65,eval((row[pos]*65*renderer.width_factor)+2)) +'px"></span>';
			}
			html+=renderer.format_number.format(row[pos]);
			html+='</td>';
			return html;
		}

		var color_class = renderer.color_map.get_color(row[pos],'b_');
		html='<td class="left">';
		if (renderer.width_factor*row[pos]>1.1) {
			html+='<span class="bar '+color_class+'" style="margin: 6px 1px;width:'+ Math.min(55,eval((row[pos]*55*renderer.width_factor)+2)) +'px"></span>';
			html+='<span class="bar '+color_class+'" style="width:1px;margin: 6px 1px;"></span>';
			html+='<span class="bar '+color_class+'" style="width:1px;margin: 6px 1px 6px 0px;"></span>';
			html+='<span class="bar '+color_class+'" style="width:10px;margin: 6px 4px 6px 1px;"></span>';
		}
		else {
			html+='<span class="bar '+color_class+'" style="width:'+ Math.min(65,eval((row[pos]*65*renderer.width_factor)+2)) +'px"></span>';
		}
		html+=renderer.format_number.format(row[pos]);
		html+='</td>';
		return html;
	}

	function render_col_iv(row,pos,renderer,columns) {
		var html = '';
		// TODO
		if (typeof renderer.color_column != "undefined") {
			var color = row[columns[renderer.color_column]];
			html='<td class="left">';
			if (renderer.width_factor*row[pos]>1.1) {
				html+='<span class="bar" style="background-color:'+color+';margin: 6px 1px;width:'+ Math.min(55,eval((row[pos]*55*renderer.width_factor)+2)) +'px"></span>';
				html+='<span class="bar" style="background-color:'+color+';width:1px;margin: 6px 1px;"></span>';
				html+='<span class="bar" style="background-color:'+color+';width:1px;margin: 6px 1px 6px 0px;"></span>';
				html+='<span class="bar" style="background-color:'+color+';width:10px;margin: 6px 4px 6px 1px;"></span>';
			}
			else {
				html+='<span class="bar" style="background-color:'+color+';width:'+ Math.min(65,eval((row[pos]*65*renderer.width_factor)+2)) +'px"></span>';
			}
			html+=renderer.format_number.format(row[pos]);
			html+='</td>';
			return html;
		}

		var color_class = renderer.color_map.get_color(row[pos],'b_');
		html='<td class="left">';
		if (renderer.width_factor*row[pos]>1.1) {
			html+='<span class="bar '+color_class+'" style="margin: 6px 1px;width:'+ Math.min(55,eval((row[pos]*55*renderer.width_factor)+2)) +'px"></span>';
			html+='<span class="bar '+color_class+'" style="width:1px;margin: 6px 1px;"></span>';
			html+='<span class="bar '+color_class+'" style="width:1px;margin: 6px 1px 6px 0px;"></span>';
			html+='<span class="bar '+color_class+'" style="width:10px;margin: 6px 4px 6px 1px;"></span>';
		}
		else {
			html+='<span class="bar '+color_class+'" style="width:'+ Math.min(65,eval((row[pos]*65*renderer.width_factor)+2)) +'px"></span>';
		}
		html+=renderer.format_number.format(row[pos]);
		html+='</td>';
		return html;
	}

	function render_col_corr(row,pos,renderer,columns) {
		var html = '';
		// TODO
		if (typeof renderer.color_column != "undefined") {
			var color = row[columns[renderer.color_column]];
			html='<td class="left">';
			if (renderer.width_factor*row[pos]>1.1) {
				html+='<span class="bar" style="background-color:'+color+';margin: 6px 1px;width:'+ Math.min(55,eval((row[pos]*55*renderer.width_factor)+2)) +'px"></span>';
				html+='<span class="bar" style="background-color:'+color+';width:1px;margin: 6px 1px;"></span>';
				html+='<span class="bar" style="background-color:'+color+';width:1px;margin: 6px 1px 6px 0px;"></span>';
				html+='<span class="bar" style="background-color:'+color+';width:10px;margin: 6px 4px 6px 1px;"></span>';
			}
			else {
				html+='<span class="bar" style="background-color:'+color+';width:'+ Math.min(65,eval((row[pos]*65*renderer.width_factor)+2)) +'px"></span>';
			}
			html+=renderer.format_number.format(row[pos]);
			html+='</td>';
			return html;
		}

		var color_class = renderer.color_map.get_color(row[pos],'b_');
		html='<td class="left">';
		if (renderer.width_factor*row[pos]>1.1) {
			html+='<span class="bar '+color_class+'" style="margin: 6px 1px;width:'+ Math.min(55,eval((row[pos]*55*renderer.width_factor)+2)) +'px"></span>';
			html+='<span class="bar '+color_class+'" style="width:1px;margin: 6px 1px;"></span>';
			html+='<span class="bar '+color_class+'" style="width:1px;margin: 6px 1px 6px 0px;"></span>';
			html+='<span class="bar '+color_class+'" style="width:10px;margin: 6px 4px 6px 1px;"></span>';
		}
		else {
			html+='<span class="bar '+color_class+'" style="width:'+ Math.min(65,eval((row[pos]*65*renderer.width_factor)+2)) +'px"></span>';
		}
		html+=renderer.format_number.format(row[pos]);
		html+='</td>';
		return html;
	}

	function render_col_woe(row,pos,renderer,columns) {
		var html = '';
		var color_class = renderer.color_map.get_color(row[pos],'b_');
		html='<td class="left" style="width:155px;">';
		// Negative

		if (row[pos] <0) {
			html+='<div style="float: left;height: 100%;margin-right:3px;">';
			html+='<div style="float:left;display:inline-block;height:100%;width:10px;"></div>';
			html+='<div style="display:inline-block;height:100%;width:45px;">';
			var neg_width = Math.min(40,eval((Math.abs(row[pos])*40*renderer.width_factor)+2));
			if (renderer.width_factor*Math.abs(row[pos])>1.1) neg_width=45;
			html+='<span class="bar_3 b_blue_99" style="display:inline-block;width:'+ (45-neg_width) +'px"></span>';
			html+='<span class="bar_3 b_red_1" style="display:inline-block;width:'+ neg_width +'px"></span>';
			html+='</div>';
			html+='<div style="display:inline-block;height:100%;width:1px;">';
			html+='</div>';
			html+='<div style="display:inline-block;height:100%;width:45px;">';
			html+='<span class="bar_3 b_blue_99" style="width:45px"></span>';
			html+='</div>';
			html+='</div>';
			html+=renderer.format_number.format(row[pos]);
		}
		else if (row[pos] >0) {
			html+='<div style="float: left;height: 100%;margin-right:3px;">';
			html+='<div style="float:left;display:inline-block;height:100%;width:10px;"></div>';
			html+='<div style="display:inline-block;height:100%;width:45px;">';
			html+='<span class="bar_3 b_blue_99" style="width:45px"></span>';
			html+='</div>';
			html+='<div style="display:inline-block;height:100%;width:1px;">';
			html+='</div>';
			html+='<div style="display:inline-block;height:100%;width:45px;">';
			var neg_width = Math.min(40,eval((Math.abs(row[pos])*40*renderer.width_factor)+2));
			if (renderer.width_factor*Math.abs(row[pos])>1.1) neg_width=45;
			html+='<span class="bar_3 b_blue_1" style="display:inline-block;width:'+ neg_width +'px"></span>';
			html+='<span class="bar_3 b_blue_99" style="display:inline-block;width:'+ (45-neg_width) +'px"></span>';
			html+='</div>';
			html+='</div>';
			html+=renderer.format_number.format(row[pos]);
		}
		else {
			html+='<div style="float: left;height: 100%;margin-right:3px;">';
			html+='<div style="float:left;display:inline-block;height:100%;width:10px;"></div>';
			html+='<div style="display:inline-block;height:100%;width:45px;">';
			html+='<span class="bar_3 b_blue_99" style="width:45px"></span>';
			html+='</div>';
			html+='<div style="display:inline-block;height:100%;width:1px;">';
			html+='</div>';
			html+='<div style="display:inline-block;height:100%;width:45px;">';
			var neg_width = 0;
			html+='<span class="bar_3 b_blue_1" style="display:inline-block;width:'+ neg_width +'px"></span>';
			html+='<span class="bar_3 b_blue_99" style="display:inline-block;width:'+ (45-neg_width) +'px"></span>';
			html+='</div>';
			html+='</div>';
		}
		html+='</td>';
		return html;
	}


	function render_col_trend(row,pos,renderer,columns) {

		var groups = row[columns[renderer.groups_column]]
		var dtype = row[columns[renderer.dtype_column]]

		if (dtype == 'nominal' || dtype == 'categorical' || groups==1) {
			return '<td>-</td>';
		}
		var val_class='';
		var val=row[pos];
		switch (val) {
			case 'ascending':
				val_class=' class="trend_flat_asc"';break;
			case 'descending':
				val_class=' class="trend_flat_desc"';break;
			case 'undefined':
				return '<td>-</td>';
			case 'valley':
				val_class=' class="trend_concave"';break;
			case 'peak':
				val_class=' class="trend_convex"';break;
		}
		return '<td'+val_class+'>'+val+'</td>';
	}

// -----------------------------------------------------------------------------
// Column headeers & renderers;
// -----------------------------------------------------------------------------

function color_map(type,value) {
	if (value > 0.009) return '>0.009';
	else return '0.009';
}

	// Get column header (th) based on column name. Its possible to customize:
	//  Force min and max column width
	//	Header text
	//	Header style
	function get_col_header(col_name,item_type,step_type,place_type) {
		var text = col_name;
		var style = '';
		let v_class = '';

		// Default;
		switch (col_name.toLowerCase()) {
			// V02 Preprocessing
			case 'numeric_conversion':text='numeric conversion';break;
			case 'nan_unique':text='nan unique';break;
			case 'special_unique':text='special unique';break;
			case 'special_constant':text='special constant';break;
			case 'special_unique':text='special unique';break;
			case 'special_unique':text='special unique';break;
			case 'block_id':text='block';break;

			// V02
			case 'n_missing': 			text='missing';style='min-width:80px;';break;
			case 'n_special': 			text='special';style='min-width:80px;';break;
			case 'd_n_zero': 				text='zero';style='min-width:80px;';break;
			case 't_n_months_no_info': 	text='months_no_info';break;
			case 't_data_div_exponential': 	text='t_divergence';break;
			case 'd_concentration': 	text='concentration';break;
			case 'd_n_categories':text='categories';break;
			case 'd_p_most_freq_category':text='%_most_frequent';break;

			case 'group_missing': 		text='M';style='min-width:12px;';break;
			case 'group_others': 		text='O';style='min-width:12px;';break;
			case 'group_special': 		text='S';style='min-width:12px;';break;
			case 'missings': 			style='min-width:84px;';break;
			case 'specials': 			style='min-width:84px;';break;
			case 'zeros': 				style='min-width:84px;';break;
			case 'smallest_bucket': 	style='min-width:84px;';break;
			case 'largest_bucket': 		style='min-width:84px;';break;
			case 'iv':
					if (place_type == 'modal') {
						style='min-width:90px;';
					}
					else style='min-width:105px;';
					break;
			case 'type': 				style='min-width:85px;';break;
			case 'dtype': 				style='min-width:55px;';break;
			case 'stability_1': 		text='stability';break;
			case 'name':
			case 'variable': 
				if (item_type == 'modelanalyzer' && step_type=='analysis') {
					style='min-width:170px;width:170px;max-width:170px;';
				}
				else {
					style='min-width:210px;width:210px;max-width:210px;';
				}
				break;
			case 'vif': 				style='min-width:50px;';break;				
			case 'action': 				style='max-width:28px;';break;
			case 'recommended_action': 	text='auto';style='max-width:28px;';break;
			case 'user_action': 	text='user';style='max-width:28px;';break;
			case 'user_comment': 	text='user comment';style='min-width:28px;';break;
			case 'status':
			case 'case': 				style='min-width:78px;';break;
			// Modal
			case 'splits': 				style='min-width:76px !important;max-width:80px !important;';break;
			case 'records count':		text='Records';break;
			case 'non-event count': 	text='Non-event';style='min-width:45px;';break;
			case 'event count': 		text='Event';style='min-width:35px;';break;
			case 'default rate': 		text='Event rate';style='min-width:35px;';break;
			case 'woe': 				style='amin-width:35px;';break;
			case '#color#': 			text='';style='min-width:7px;width:7px;';break;


			// Preprocessing summary
			case 'duplicated_of':
				style='min-width:155px;';
				break;
		}

		if (item_type=='modelgenerator') {
			switch (col_name.toLowerCase()) {
			// Model generator
			case 'name':
				text='model';
				break;
			case 'feature_selection':
				text=col_name.replace('_',' ');
				break;
			case 'n_features':
			case 'condition_number':
				text=col_name.replace('_',' ');
				break;
			case 'max_corr':
				break;
			case 'time_total':
				text=col_name.replace('_',' ');
				v_class = 'b_group_3';
				break;
			case 'time_feature_selection':
				text=col_name.replace('_',' ');
				v_class = 'b_group_3';
				break;
			case 'time_estimator':
				text=col_name.replace('_',' ');
				v_class = 'b_group_3';
				break;
			case 'time_metrics':
				text=col_name.replace('_',' ');
				v_class = 'b_group_3';
				break;
			// case 'gini':
			// 	v_class = 'b_group_3';
			// 	break;
			case 'auc_roc':
				v_class = 'b_group_3';
				break;
			case 'auc_pr':
				text=col_name.replace('_',' ');
				v_class = 'b_group_4';
				break;
			case 'f1_score_0':
			case 'f1_score1':
				v_class = 'b_group_4';
				break;
			case 'cohen_kappa':
			case 'discriminant_power':
			case 'balanced_accuracy':
				text=col_name.replace('_',' ');
				v_class = 'b_group_4';
				break;
			case 'jeffrey_divergence':
			case 'wasserstein_distance':
			case 'taneja_divergence':
			case 'kolmogorov_smirnov':
			case 'intersection':
			case 'youden':			
				text=col_name.replace('_',' ');
				v_class = 'b_group_5';
				break;
			}
		}

		if (step_type=='analysis' || step_type == 'run') {
			switch (col_name.toLowerCase()) {
				case 'comment':
					text = '<span class="icon_warning"></span>';
					style='min-width:32px;';
					break;
			}
		}



		if (step_type=='apply' || step_type=='transform') {
			switch (col_name.toLowerCase()) {
				case 'recommended_action':
				case 'user_action':
					v_class = 'b_group_1';
					break;				
				case 'user_comment':
					v_class = 'left b_group_1';
					style='min-width:300px;';
					break;				
				// case 'action':
				// 	style='min-width:400px;';
				// 	v_class = 'left';
				// 	break;				
				case 'comment':
					text = '<span class="icon_warning"></span>';
					//text = 'reason';
					style='min-width:400px;';
					v_class = 'left';
					break;
			}
		}

		return '<th class="'+v_class+'"style="'+style+'">'+text+'</th>';
	}

	// Set column renderer:
	function assing_col_render(item_type,step_type,place_type,col_name) {
		var renderer = new Object();
		renderer.class='';
		renderer.format_number = fmt_num_basic;
		renderer.color_map = new color_mapper({type:null});
		var name ='';
		if (item_type=='univariate') {
			if (step_type=='analysis' || step_type == 'run') {
				switch (col_name) {
					case 'variable':
					case 'name':
						name='linked_variable';
						break;
					// case 'comment':
					// 	name='comment2';
					// 	break;
					//case 'action':
					//	name='action';
					//	break;
					// layout v01
					case '%_special':name='none';break;
					case 'specials':
						name='numeric_num_pct';
						renderer.pct_column='%_special';
						renderer.color_map = new color_mapper({
							type : 'numeric',
							data_list : [0.75,0.95,null],
							color_list : ['','orange_1','red_1']
							});
						break;
					// layout v02
					case 'p_special':name='none';break;
					case 'n_special':
						name='numeric_num_pct';
						renderer.pct_column='p_special';
						renderer.color_map = new color_mapper({
							type : 'numeric',
							data_list : [0.75,0.95,null],
							color_list : ['','orange_1','red_1']
							});
						break;
					// layout v01
					case '%_missing':name='none';break;
					case 'missings':
						name='numeric_num_pct';
						renderer.pct_column='%_missing';
						renderer.color_map = new color_mapper({
							type : 'numeric',
							data_list : [0.75,0.95,null],
							color_list : ['','orange_1','red_1']
							});
						break;
					// layout v02	
					case 'p_missing':name='none';break;					
					case 'n_missing':
						name='numeric_num_pct';
						renderer.pct_column='p_missing';
						renderer.color_map = new color_mapper({
							type : 'numeric',
							data_list : [0.75,0.95,null],
							color_list : ['','orange_1','red_1']
							});
						break;
					// layout v01
					case '%_zeros':name='none';break;
					case 'zeros':
						name='numeric_num_pct';
						renderer.pct_column='%_zeros';
						renderer.color_map = new color_mapper({
							type : 'numeric',
							data_list : [0.75,0.95,null],
							color_list : ['','orange_1','red_1']
							});
						break;
					// layout v02
					case 'd_p_zero':name='none';break;
					case 'd_n_zero':
						name='numeric_num_pct';
						renderer.pct_column='d_p_zero';
						renderer.color_map = new color_mapper({
							type : 'numeric',
							data_list : [0.75,0.95,null],
							color_list : ['','orange_1','red_1']
							});
						break;

					// layout v02
					case 't_info_div_uniform': 	name='none';break;
					case 't_info_div_exponential':name='none';break;
					case 't_data_div_uniform':name='none';break;
					case 't_data_div_exponential':
						name='max';
						renderer.input_columns=['t_info_div_uniform',
												't_info_div_exponential',
												't_data_div_uniform',
												't_data_div_exponential'];
						renderer.format_number = fmt_dec_3;
						renderer.color_map = new color_mapper({
							type : 'numeric',
							data_list : [0.10,0.16,null],
							color_list : ['','orange_1','red_1']
							});
						break;
					case 'quality_score':
						renderer= new field_renderer({
							type:'bar',
							data_type:'table',
							container_css:'padding-left:15px;',
							cell_align:'right',
							value_position:'top',
							value_align:'left',
							value_max:1,
							value_css_class:'f10',
							value_format:fmt_pct_1_1,
							//value_color_map:,							
							bar_width:'70px',
							bar_color_map:
								new color_mapper({
									type : 'numeric',
									data_list : [0.10,0.30,null],
									color_list : ['red_1','orange_1','blue_1']
								}),
						});
						break;
					case 'd_coeff_disp_nonparam':
					case 'd_coeff_disp_param':
					case 'd_hist_cols':
					case 'd_hist_pos':
					case 'd_concentration_interval':
						name='none';
						break;
					case 'd_concentration':
						name='numeric';
						renderer.format_number = fmt_dec_3;
						renderer.color_map = new color_mapper({
							type : 'numeric',
							data_list : [0.60,0.90,null],
							color_list : ['','orange_1','red_1']
							});
						break;
					case 'd_n_categories':
						name='numeric';
						renderer.class='right';
						renderer.format_number = fmt_int;
						break;
					case 'd_most_freq_category':	name='none';break;
					case 'd_top_categories':	name='none';break;
					case 'd_n_top_categories':	name='none';break;
					case 'd_hhi':	name='none';break;
					case 'd_hhi_norm':	name='none';break;
					case 'd_p_most_freq_category':
						name='pct_label';
						renderer.label_column='d_most_freq_category';
						renderer.label_max_length=7;
						renderer.format_number = fmt_pct_1_1;
						renderer.color_map = new color_mapper({
							type : 'numeric',
							data_list : [0.90,0.99,null],
							color_list : ['','orange_1','red_1']
							});
						break;

					// v01
					case 'stability_2': 	name='none';break;
					case 'stability_info_1':name='none';break;
					case 'stability_info_2':name='none';break;
					case 'stability_1':
						name='max';
						renderer.input_columns=['stability_1',
												'stability_2',
												'stability_info_1',
												'stability_info_2'];
						renderer.format_number = fmt_dec_3;
						renderer.color_map = new color_mapper({
							type : 'numeric',
							data_list : [0.10,0.16,null],
							color_list : ['','orange_1','red_1']
							});
						break;

					case 'concentration':
						name='numeric';
						break;

					// Categorical & Nomminal - v01
					case 'most_freq_category':	name='none';break;
					case '%_most_freq_category':
						name='pct_label';
						renderer.label_column='most_freq_category';
						renderer.label_max_length=7;
						renderer.format_number = fmt_pct_1_1;
						renderer.color_map = new color_mapper({
							type : 'numeric',
							data_list : [0.90,0.99,null],
							color_list : ['','orange_1','red_1']
							});
						break;
					case 'categories':
						name='numeric';
						renderer.class='right';
						renderer.format_number = fmt_int;
						break;


					// Disabled columns num
					case 'unique_specials':	name='none';break;
					case 'concentration_interval':name='none';break;
					case 'min':name='none';break;
					case 'max':name='none';break;
					case 'mean':name='none';break;
					case 'std':name='none';break;
					case 'mode':name='none';break;
					case 'percentile_1':name='none';break;
					case 'percentile_25':name='none';break;
					case 'median':name='none';break;
					case 'percentile_75':name='none';break;
					case 'percentile_99':name='none';break;
					case 'outlier_high':name='none';break;
					case 'outlier_low':name='none';break;
					case 'negatives':name='none';break;
					case 'positives':name='none';break;
					case 'coeff_dispersion_parametric':name='none';break;
					case 'coeff_dispersion_nonparametric':name='none';break;

					// layout v02
					case 'u_special':name='none';break;
					case 'd_min':name='none';break;
					case 'd_max':name='none';break;
					case 'd_mean':name='none';break;
					case 'd_std':name='none';break;
					case 'd_mode':name='none';break;
					case 'd_n_neg':name='none';break;
					case 'd_n_pos':name='none';break;
					case 'd_percentile_1':name='none';break;
					case 'd_percentile_25':name='none';break;
					case 'd_median':name='none';break;
					case 'd_percentile_75':name='none';break;
					case 'd_percentile_99':name='none';break;
					case 'd_outlier_high':name='none';break;
					case 'd_outlier_low':name='none';break;
					case 'd_n_outlier_high':name='none';break;
					case 'd_n_outlier_low':name='none';break;					

					// Disabled columns cat
					case 'concentration_hhi':name='none';break;
					case 'concentration_hhi_norm':name='none';break;
				}
			}
		}
		else if (item_type=='optimalgrouping' || item_type=='bivariate' || item_type=='bivariatecontinuous') {
			if (step_type=='analysis' || step_type == 'run') {
				switch (col_name) {
					case 'name':
					case 'variable': 	name='linked_variable';break;
					case 'monotonicity':
					case 'pd_monotonicity':
						name='trend';
						renderer.groups_column='groups';
						renderer.dtype_column='dtype';
						break;
					case 'groups':
						name='squares';
						renderer.max_squares = 10;
						renderer.color_map = new color_mapper({
									type : 'exact',
									data_list : [0],
									color_list : ['red_1']
									});
						break;
					case 'group_missing':
					case 'group_others':
					case 'group_special':
				 		name='squares';
						renderer.max_squares = 1;
						break;

					case 'max_p_value':
						name='numeric';
						renderer.format_number = fmt_dec_3;
						renderer.class = 'center';
						renderer.color_map = new color_mapper({
									type : 'numeric',
									data_list : [0.05,0.10,null],
									color_list : ['','orange_1','red_1']
									});
						break;
					case 'pvalue_median':
					case 'pvalue_welch_t':
					case 'pvalue_mann_whitney':
					case 'cramer_v':
					case 'pvalue_chi2':
						name='numeric';
						renderer.format_number = fmt_dec_3;
						break;
					case 'mean_absolute_error':name='none';break;
					case 'pvalue_chi2_max':
						name='numeric';
						renderer.format_number = fmt_dec_3;
						renderer.color_map = new color_mapper({
									type : 'numeric',
									data_list : [0.05,0.10,null],
									color_list : ['','orange_1','red_1']
									});
						break;

					case 'largest_bucket_(%)':name='none';break;
					case 'largest_bucket':
						name='numeric_num_pct';
						renderer.pct_column='largest_bucket_(%)';
						break;

					case 'smallest_bucket_(%)':name='none';break;
					case 'smallest_bucket':
						name='numeric_num_pct';
						renderer.pct_column='smallest_bucket_(%)';
						break;

					case 'std_buckets':
						name='numeric';
						renderer.class='right';
						renderer.format_number = fmt_int;
						break;

					// Internal hidden columns;
					case '#color#': name='colorbox';break;

					// Modal
					case 'non-event count':
						name='none';break;
					case 'records count':
					case 'event count':
						name='numeric';
						renderer.class='right';
						renderer.format_number = fmt_int;
						break;
					case 'default rate':
						name='numeric';
						renderer.class='right';
						renderer.format_number = fmt_pct_2_2;
						break;
					case 'woe':
						name='woe';
						renderer.format_number = fmt_dec_3;
						if (place_type=='modal') {
							// max-width for a value of 0.25
							renderer.width_factor = 0.54;
							//renderer.color_column = '#color#';
							renderer.color_map = new color_mapper({
								type : 'numeric',
								data_list : [null],
								color_list : ['white_9']
							});
						}
						//renderer.class='right';
						//renderer.format_number = fmt_pct_1_3;
						break;
					case 'splits':
						name='string';
						renderer.tooltip=true;
						renderer.max_length = 10;
						renderer.class='left';
						renderer.style='padding-left:5px;';
						//renderer.format_number = fmt_pct_1_3;
						break;
					case 'corr_pearson':
					case 'corr_kendalltau':
					case 'r2_score':
					case 'gini':
							name='numeric';
							renderer.format_number = fmt_pct_2_2;
							/*
							renderer.color_map = new color_mapper({
								type : 'numeric',
								data_list : [0.5,0.6,0.7,null],
								color_list : ['red_1','yellow_1','orange_1','white_9']
							});
							*/
							break;
				}
			}
		}
		renderer.name=name;
		// Default
		if (renderer.name=='') {
			switch (col_name) {
				case 'name':
				case 'variable': 	
					renderer.name='raw';
					break;
	            case 'block_id':        
	                renderer.name='block_number';
	                renderer.format_number = fmt_int_2;
	                break;
	            case 'action':                        
	                renderer.name='action_tooltip';
	                break;            
	            case 'recommended_action':        
	                renderer.name='action_tooltip';
	                if (step_type=='transform') {
	                	renderer.class = 'b_group_1';
	                	renderer.importance_level='second';
	                }
	                renderer.comment_col='comment';
	                break;            
	            case 'comment':                        
	            case 'status':                        
	                renderer.name='none';
	                break;     
	            case 'user_action':    
	                renderer.name='action_tooltip';
	                renderer.tooltip='disabled';
	                renderer.importance_level='second';
	                renderer.class = 'b_group_1';
	                break;
	            case 'user_comment':    
	                renderer.name='text';
	                renderer.class = 'pl10 left b_group_1';
	                break;
				default:  			
					name='raw';
					break;
			}
		}
		return renderer;
	}

	function apply_col_render(renderer,row,pos,columns,row_number,details_id) {
		switch (renderer.name) {
			case 'linked_variable': return render_col_linked_variable(row,pos,row_number,details_id);
			case 'action': 	return render_col_action(row,pos);
			case 'comment': 	return render_col_case(row,pos,columns['action'],"width:200px;");
			case 'alert_tooltip': 	return render_col_alert_tooltip(row,pos,columns['action'],"width:47px;");
			case 'case': 		return render_col_case(row,pos,columns['action'],"width:50px;text-align:left;");
			case 'check': 	return render_col_check(row,pos,columns['action']);
			case 'block_number': 	return render_col_block_number(row,pos,renderer);
			case 'stability': 	return render_col_stability(row,pos);
			case 'trend': 			return render_col_trend(row,pos,renderer,columns);
			case 'squares': 		return render_col_squares(row,pos,renderer);
			case 'raw': 			return render_col_raw(row,pos,renderer);
			case 'text': return render_col_text(row,pos,renderer,columns);
			case 'numeric': 		return render_col_numeric(row,pos,renderer);
			case 'corr_bar': 		return render_col_corr(row,pos,renderer,columns);
			case 'iv': 				return render_col_iv(row,pos,renderer,columns);
			case 'iv_old': 				return render_col_iv_old(row,pos,renderer,columns);
			case 'woe': 				return render_col_woe(row,pos,renderer,columns);
			case 'action_plus': 	return render_col_action_plus(row,pos,renderer,columns);
			case 'action_tooltip': 	return render_col_action_tooltip(row,pos,renderer,columns);
			case 'action2': 	return render_col_action2(row,pos,renderer,columns);
			case 'comment2': 	return render_col_comment2(row,pos,renderer,columns);
			case 'numeric_num_pct': return render_col_numeric_num_pct(row,pos,renderer,columns);
			case 'pct_label': return render_col_pct_label(row,pos,renderer,columns);
			case 'string': return render_col_string(row,pos,renderer,columns);
			case 'max': return render_col_max(row,pos,renderer,columns);
			case 'colorbox': return render_col_colorbox(row,row_number,pos,renderer,columns);
			case 'none': 		return '';
			//case 'bar': 				return render_field_bar(row,pos,renderer,columns);
			default:  		return render_col_raw(row,pos);
		}
	}

// -----------------------------------------------------------------------------------------------------
// Block renderers;
// -----------------------------------------------------------------------------------------------------

	// -----------------------------------------------------------------------------------------------------
	function get_block_description(block_name) {
		switch (block_name) {
			case 'column_analysis': return 'Column analysis';
			case 'duplicates_analysis': 	return 'Duplicate analysis';
			case 'block_analysis': 	return 'Block analysis';
			case 'db_info': 		return 'Database information';
			case 'db_info_expanded':return 'Database information';
			case 'parameters':      return 'Parameters';
			case 'config': 			return 'Parameters';
			case 'cpu_time': 		return 'CPU time';
			case 'results': 		return 'Results';
			case 'details': 		return 'Details';
			case 'table': 			return '';
			case 'table_num_ord': 	return 'Numerical & Ordinal variables';
			case 'table_cat_nom': 	return 'Categorical & Nominal variables';
			case 'model_analysis': 	return 'Model generator information';
			default:  				return block_name;
		}
	}
	// -----------------------------------------------------------------------------------------------------
	function get_block_subdescription(block_name) {
		switch (block_name) {
			default:  				return '';
		}
	}
	// -----------------------------------------------------------------------------------------------------
	function render_block_piechart(item,step,element,block) {
		var html =[];
		var num_rows=block.block_data.data.length;
		var id_graph='';
		html.push('<div class="block_piechart">');

		var graph_data =[];
		var num_rows=block.block_data.data.length;
		var total_value=0;
		//console.log(block.block_data);
		for (var i = 0; i < num_rows; i++) {
			if (block.block_data.index[i]=='total') {
				// todo: hotfix, to be replaced
				if (block.block_data.data[i] == null) {
					total_value=-1;
					block.block_data.data[i]=0;
				}
			}
			var graph_data_el = {};
			if (block.block_data.index[i]!='total' & block.block_data.data[i]!=0) {
				graph_data_el.name = block.block_data.index[i];
				graph_data_el.value = block.block_data.data[i];
				graph_data.push(graph_data_el);
				total_value+=block.block_data.data[i];
			}
		}
		total_value=total_value.toFixed(3);

		html.push('<h1 class="block_title">'+get_block_description(block.type)+': <span class="block_title_extra">'+total_value+'s</span></h1>');

		if (graph_data.length<2) {
			html.push('</div>');
			return html.join('');
		}

		id_graph='chart_'+step.pos+'_'+element.pos+'_'+block.pos+'_'+Date.now();
		html.push('<div class="echart_chart" id="'+id_graph+'" style="text-aling:center;display: flex;widjth: 230px; height: 110px;"></div>');

		var graph_echart = new Object();
		graph_echart.html_element_id=id_graph;
		graph_echart.options= {
			series: {
				type: 'pie',
				radius: ['35%', '43%'],
				silent: true,
				startAngle: 90,
				color:['#1973B8','#2DCCCD','#F35E61', '#F8CD51'],
				// V19 color:['#49a5e6','#ea9234', '#f6cb51', '#e65068'],
				label: {
				  verticalAlign: 'middle',
				  align: 'left',
				  fontSize : 11,
				  formatter : function (params){
					return  params.name.replace(' ','\n') + '\n' + params.value.toFixed(2) + 's';
				  }
				},
				labelLine: {show:false,length:0,length2:7},
				options: {
					maintainAspectRatio: true,responsive: true
				},
				data: graph_data
			}
		}

		step.graphs.push(graph_echart);
		html.push('</div>');
		return html.join('');
	}

	// -----------------------------------------------------------------------------------------------------
	function render_block_table(item,step,element,block) {
		let html =[];
		let num_rows=block.block_data.data.length;
		html.push('<div class="block_table">');
		html.push('<h1 class="block_title">'+get_block_description(block.type)+'</h1>');
		html.push('<table>');
		for (let i = 0; i < num_rows; i++) {
			html.push('<tr><td>'+block.block_data.index[i]+'</td><td class="value">'+fmt_int.format(block.block_data.data[i])+'</td></tr>');
		}
		html.push('</table>');
		html.push('</div>');
		return html.join('');
	}
	// -----------------------------------------------------------------------------------------------------
	function render_block_raw(item,step,element,block) {
		let html ='';		
		html+='<div class="block_raw">';
		html+=JSON.stringify(block.block_data);
		html+='</div>';
		return html;		 
	}
	// -----------------------------------------------------------------------------------------------------
	function render_block_config(item,step,element,block) {
		let html =[];
		let num_rows=block.block_data.data.length;
		html.push('<div class="block_config">');
		html.push('<h1 class="block_title">'+get_block_description(block.type)+'</h1>');
		for (let i = 0; i < num_rows; i++) {
			html.push('<span class="config_option">'+block.block_data.index[i]+':</span> ');
			html.push('<span class="config_value">'+block.block_data.data[i]+'</span><br/>');
		}
		html.push('</div>');
		return html.join('');
	}

	// -----------------------------------------------------------------------------------------------------
	// Global
	// -----------------------------------------------------------------------------------------------------
	var elem_particles = document.getElementById('particles');
	var elem_loading = document.getElementById('loading');
	var current_elem= document.getElementById('frontpage');
	var current_id= 'frontpage';

	// -----------------------------------------------------------------------------------------------------
	function change_item(clicked_id) {
		console.time('change_item');
		var clicked_element=document.getElementById(clicked_id);

		if (current_id!='frontpage'){
			console.time('_remove_element()');
			let current_item_id=current_id.split('_')[0];
			let current_step_id=current_id.split('_')[1];

			let current_item=model.items_data[current_item_id];
			if(!(current_step_id in current_item.steps)){
				current_step_id = current_item.steps[Object.keys(current_item.steps)[0]].id;
			}
			let current_step=current_item.steps[current_step_id];

			for (var i = 0; i < current_step.graphs.length; i++) {
				var graph_element_id=document.getElementById(current_step.graphs[i].html_element_id);
				if (current_step.graphs[i].disabled!=1) {
					window.echarts.getInstanceById(graph_element_id.getAttribute('_echarts_instance_')).dispose();
				}
				// ToDo, save the echart instance to improve performance
				//content_items[selected_item_id].steps[selected_step_id].graphs[i].chart_obj.dispose();
			}

			console.time('_remove_element(dom)');
			current_elem.firstChild.remove();
			console.timeEnd('_remove_element(dom)');

			for (var i = 0; i < current_step.datatables.length; i++) {
				current_step.datatables[i].table_obj.clear();
				current_step.datatables[i].table_obj.destroy(true);
				delete current_step.datatables[i].table_obj;
			}
			console.timeEnd('_remove_element()');
		}

		// Set current element & id
		current_elem=clicked_element;
		current_id=clicked_id;

		if (current_id=='frontpage'){
			elem_particles.style.display = "block";
			seed1=1;seed2=1;seed3=1;
			window.pJSDom[0].pJS.particles.move.enable = true;
			window.pJSDom[0].pJS.fn.particlesRefresh();
		}
		else {
			console.time('_prepare_item_data()');
			var clicked_item_id=clicked_id.split('_')[0];
			var clicked_step_id=clicked_id.split('_')[1];

			// Todo: This function should be in the main controller
			console.time('_prepare_item_data(2)');

			let clicked_item = model.core.item_collect_data(clicked_item_id);

			if(!(clicked_step_id in clicked_item.steps)){
				if ((typeof window[clicked_item.core] == 'object' && window[clicked_item.core].general_summary) || 
					clicked_step_id != "00"){
					// the last comparison in OR is included to avoid showing the first
					// step in empty steps different from the "00".
						// new step
						let step = {};
						step.pos = Object.keys(clicked_item.steps).length + 1;
						step.id = clicked_step_id;
						step.status = 'parsed';
						step.type = '';
						step.contents = [];
						step.graphs = [];
						step.datatables = [];
						step.html = '';
						clicked_item.steps[clicked_step_id] = step;
				}
				else{
					clicked_step_id = clicked_item.steps[Object.keys(clicked_item.steps)[0]].id;
				}
			}
			let clicked_step = clicked_item.steps[clicked_step_id];
			console.timeEnd('_prepare_item_data(2)');

			// Set current module if exists
			if (typeof window[clicked_item.core] == 'object') {
				model.core = window[clicked_item.core];
			}
			else model.core = model.base_core;

			console.time('_prepare_item_data(1)');
			model.core.step_process(clicked_item,clicked_step_id);
			console.timeEnd('_prepare_item_data(1)');

			console.timeEnd('_prepare_item_data()');

			console.time('_append_content()');
			document.getElementById(clicked_id).insertAdjacentHTML('beforeend', clicked_step.html);
			console.timeEnd('_append_content()');

			console.time('_init_datatable()');
			for (var i = 0; i < clicked_step.datatables.length; i++) {
				var table_obj = $('#'+clicked_step.datatables[i].html_element_id).DataTable({
					"dom": "fBritS", buttons: [ 'csv' ],processing : true,"paging":true,"iDisplayLength":-1,
					scrollY: "100vh" ,scrollX:true,scroller:true,"autoWidth": false,
					"deferRender": true,"searchDelay": 250,"stripeClasses":[],"order":[]
				});

				//table_obj.columns.adjust2();
				clicked_step.datatables[i].table_obj=table_obj;
				resizeColumns(table_obj);
				let table_aux = document.getElementById(clicked_step.datatables[i].html_element_id);
				if (clicked_step.datatables[i].options.datatable_class == 'grid_datatable') {
					table_aux.parentElement.style.height='100%';
					table_aux.nextSibling.style.height='100%';					
				}
			}
			console.timeEnd('_init_datatable()');

			console.time('_init_charts()');
			for (var i = 0; i < clicked_step.graphs.length; i++) {
				showGraph(clicked_step.graphs[i],0);					
			}

			console.timeEnd('_init_charts()');
		}
		// ???? timeout or new_content
		//setTimeout(function() {
			//current_elem.style.animation = '0.1s ease 0s fadein800';
			//x999 current_elem.style.display = "block";
			//elem_loading.style.display = "none";
			//current_elem.style.opacity = 1;
		current_elem.style.display = "block";
		elem_loading.style.opacity=0;
		//}, 0);
		maincontView.resizeObserver.observe(current_elem);
		console.timeEnd('change_item');
	};
	// resize datatable
	function resizeColumns(datatable) {
		setTimeout(function() {datatable.columns.adjust();}, 0);
	}


// ---------------------------------------------------------------------------------
function rounding(x) {
	var abs_x=Math.abs(x);
	switch (true) {
		case (abs_x == 0): return 0;
		case (abs_x < 0.01): return 4;
		case (abs_x < 0.1): return 3;
		case (abs_x < 1): return 2;
		case (abs_x < 10): return 2;
		default: return 0;
	}
}

function format_number(x,type='str') {
	if (x == null) return '';
	if (type=='%') return x.toLocaleString('en-US',{  minimumFractionDigits:2, maximumFractionDigits:2 });
	if (type=='str') return x.toLocaleString('en-US',{ minimumFractionDigits:rounding(x), maximumFractionDigits:rounding(x) });
	return x.toFixed(rounding(x));
}

function fmt_num(x,type='str') {
	if (x == null) return '';
	if (type=='%.1') return x.toLocaleString('en-US',{style: "percent", minimumFractionDigits:0, maximumFractionDigits:1 });
	if (type=='%') return x.toLocaleString('en-US',{style: "percent", minimumFractionDigits:2, maximumFractionDigits:2 });
	if (type=='0') return x.toLocaleString('en-US',{ minimumFractionDigits:0, maximumFractionDigits:0 });
	if (type=='2') return x.toLocaleString('en-US',{ minimumFractionDigits:2, maximumFractionDigits:2 });
	if (type=='4') return x.toLocaleString('en-US',{ minimumFractionDigits:4, maximumFractionDigits:4 });
	if (type=='str') return x.toLocaleString('en-US',{ minimumFractionDigits:rounding(x), maximumFractionDigits:rounding(x) });
	return x.toFixed(rounding(x));
}

// Assesment
// -------------------------------------------------------------------------

function asses_stability(info_stability,info_stability_w) {
	switch (true) {
		case (info_stability>0.16 || info_stability_w>0.16): return 'red';
		case (info_stability>0.10 || info_stability_w>0.10): return 'orange';
	}
	return '';
}
function asses_months_no_info(months,informed_months) {
	switch (true) {
		case (informed_months/months < 0.75): return 'red';
		case (months-informed_months > 0): return 'orange';
	}
	return '';
}

function asses_univariate(variable,values) {
	switch (variable) {
		case 'missing_perc':
		case 'special_perc':
			switch (true) {
				case (values[0] > 0.95): return 't_red b';
				case (values[0] > 0.75): return 't_orange b';
			}
			return;
		case (months-informed_months > 0): return 't_orange';
	}
	return '';
}

// -------------------------------------------------------------------------
function get_interval_desc(init,end) {
	let desc ='';
	desc = '<span class="blue_labels">[ </span><span>'+init+'</span> <span class="blue_labels">,</span> <span>'+end+'</span><span class="blue_labels"> ]</span>';
	return desc;
}

var red_1 	 = '#e65068';
var red_2 	 = '#d66b7c';
var orange_1 = '#ea9234';
var blue_1 	 = '#49a5e6';
var blue_0 	 = '#175da4';
//#d66b7c #a72424 #b59292
// -------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// eCharts
//-----------------------------------------------------------------------------

// Initialize and resize chart;
function showGraph(graph,timeout=1) {
	if (graph.disabled==1) return;
	setTimeout(function() {
		var graph_element_id=document.getElementById(graph.html_element_id);
		var myChart = echarts.init(graph_element_id, null,{renderer: 'svg'}).setOption(graph.options);
		//var graph_instance_id=graph_element_id.getAttribute('_echarts_instance_');
		//var graph_instance=window.echarts.getInstanceById(graph_instance_id);
		//graph_instance._zr.animation._paused=true;
		/*
		setTimeout(function() {
		graph_instance._zr.clearAnimation();},200);
		*/
		//console.log(graph_instance);
	}
	, timeout);
}
function showGraphNow(graph) {
	if (graph.disabled==1) return;
	var graph_element_id=document.getElementById(graph.html_element_id);
	var myChart = echarts.init(graph_element_id, null,{renderer: 'svg'}).setOption(graph.options);
}

function refreshGraphNow(graph) {
	if (graph.disabled==1) return;
	var graph_element_id=document.getElementById(graph.html_element_id);
	graph_element_id.firstElementChild.style.width='100%';
	graph_element_id.firstElementChild.style.height='100%';
	var graph_instance_id=graph_element_id.getAttribute('_echarts_instance_');
	var graph_instance=window.echarts.getInstanceById(graph_instance_id);
	graph_instance._model.option.animation = false;
	graph_instance.resize();
	graph_element_id.firstElementChild.style.width='100%';
	graph_element_id.firstElementChild.style.height='100%';
}

// Dispose chart;
function disposeGraph(graph) {
	if (graph.disabled==1) return;
	var graph_element_id=document.getElementById(graph.html_element_id);
	var graph_instance_id=graph_element_id.getAttribute('_echarts_instance_');
	window.echarts.getInstanceById(graph_instance_id).dispose();
}

//-----------------------------------------------------------------------------

var keyboard_disabled=false;
var elem_modal_div = document.getElementById('modal_div');

//-----------------------------------------------------------------------------
// Modal boxes
//-----------------------------------------------------------------------------


// User interaction;
//-----------------------------------------------------------------------------

$(document).on('click','.modal_box_item',function(){
	modalObject.change_item(this.getAttribute('pos'));
});

var modalObject;
// Open modal box;
$(document).on('click','.modal_button',function(){
	var content_id=this.getAttribute('id');
	var item_id = content_id.split('_')[0];
	var step_id = content_id.split('_')[1];
	var datatable_pos = content_id.split('_')[3];

	let datatable = model.items_data[item_id].steps[step_id].datatables[datatable_pos];
	let step_type = model.items_data[item_id].steps[step_id].type;
	let item_type = model.items_data[item_id].type;
	let layout_version = model.items_data[item_id].layout_version;

	var table_obj = datatable.table_obj;
	var filtered_rows = table_obj.rows({order:'applied', search:'applied'})[0];
	var indexed_list = datatable.indexed_list;
	var indexed_desc_list = datatable.indexed_desc_list;

	var nav_list = [];
	var nav_desc_list = [];
	for (var i = 0; i < filtered_rows.length; i++) {
		nav_list.push(indexed_list[filtered_rows[i]]);
		nav_desc_list.push(indexed_desc_list[filtered_rows[i]]);
	}
	var nav_pos = nav_list.indexOf(content_id);

	modalObject = new modalBox( elem_modal_div,
								nav_list,
								nav_desc_list,
								nav_pos,
								item_type,
								step_type,
								layout_version);
	modalObject.show_modal();
});

// Close modal box;
$(document).on('click','#modal_close',function(){
	modalObject.close();
});

function mouseOver_tooltip(obj){
    let position = obj.parentElement.parentElement.parentElement.getBoundingClientRect();
    obj.nextElementSibling.style.top=position.top+'px';
    obj.nextElementSibling.style.left=position.right+'px';
}
// Onclick global event listener
// todo: move this
window.onclick = function(event) {
	if (event.target == elem_modal_div) {
		modalObject.close();
	}
	// lite-modal
	let target_class = event.target.className;
	switch (target_class) {
		case 'modal_close':
			event.target.parentElement.parentElement.classList.remove("shown");
			event.target.parentElement.parentElement.parentElement.style.opacity=0;
			setTimeout(()=>{
				event.target.parentElement.parentElement.parentElement.style.display = "none";			
			},300);				
			break;
		case 'lite-modal':
			event.target.firstElementChild.classList.remove("shown");
			event.target.style.opacity=0;
			setTimeout(()=>{
				event.target.style.display = "none";			
			},300);
			break;					
		case 'lite-modal-button':
			event.target.nextElementSibling.style.display = "flex";
			setTimeout(()=>{
				event.target.nextElementSibling.firstElementChild.classList.add("shown");;
				event.target.nextElementSibling.style.opacity=1;
			},100);
			break;
	}
}

$(document).keyup(function(e) {
	if (typeof modalObject == 'undefined') return;
	var is_modal_active = elem_modal_div.style.display;
	if (e.originalEvent.code === "Escape" & is_modal_active !='none') {
		modalObject.close();
		setTimeout(function() {keyboard_disabled=false;}, 30);
	}
});

// Modal box navigation;
$(document).keyup(function(e) {
	if (keyboard_disabled==true) console.log('missed_keypress');
	if (keyboard_disabled==true) return;
	const modal_active = controller.get_modal_active();
	if (modal_active==false) return;
	keyboard_disabled=true;

	let keyCode=e.originalEvent.keyCode;
	// Left: Show previous;
	if ( keyCode=="37" | keyCode=="38") {
		modalObject.change_item(Math.max(0,modalObject.nav_pos-1));
	}
	// Right: Show next;
	else if ( keyCode=="39" | keyCode=="40") {
		modalObject.change_item(Math.min(modalObject.nav_list.length-1,modalObject.nav_pos+1));
	}
	// Home
	else if ( keyCode=="36") {
		modalObject.change_item(0);
	}
	// End
	else if ( keyCode=="35") {
		modalObject.change_item(modalObject.nav_list.length-1);
	}
	// Pageup
	else if ( keyCode=="33") {
		modalObject.change_item(Math.max(0,modalObject.nav_pos-14));
	}
	// Pagedown
	else if ( keyCode=="34") {
		modalObject.change_item(Math.min(modalObject.nav_list.length-1,modalObject.nav_pos+14));
	}
	//keyboard_disabled=false;
	//console.log('changed(keyboard_disabled):'+keyboard_disabled);
	setTimeout(function() {keyboard_disabled=false;	console.log('changed(keyboard_disabled):'+keyboard_disabled);}, 0);
});


window.onresize = function() {
	//console.log("Resize:");
	if (typeof modalObject != "undefined") {
		modalObject.elem_nav_panel_height = modalObject.elem_nav_panel.clientHeight;
		modalObject.refresh_content_assets()
	}
	// Todo: Include resizeColumns datables;
}

// Modal box class definition
//-----------------------------------------------------------------------------
class modalBox {

  //---------------------------------------------------------------------------
  constructor(elem_container,nav_list,nav_desc_list,nav_pos,item_type,step_type,layout_version) {
	this.elem_container = elem_container;
	this.elem_nav_panel = elem_container.firstElementChild.lastElementChild.firstElementChild;
	this.elem_content = elem_container.firstElementChild.lastElementChild.lastElementChild;
	this.elem_nav_panel = document.getElementById('a1');

	// Invalidate scroll position on scroll event
    this.elem_nav_panel.addEventListener('scroll', (event)=>{
      	if (this.disable_scroll_event==false) this.valid_scroll_pos=false;
    });

	this.elem_nav_panel_height = null;
	this.scroll_pos = 440;
	this.disable_scroll_event = false;
	this.valid_scroll_pos = true;
	this.elem_content = document.getElementById('a2');
	this.elem_box = document.getElementById('a3');

	this.nav_list = nav_list;
	this.nav_desc_list = nav_desc_list;
	this.nav_pos = parseInt(nav_pos);
	this.data= '';
	this.content_html = '';
	this.content_class = '';
	this.nav_html = '';
	this.graphs = [];
	this.datatables = [];
	this.item_type = item_type;
	this.step_type = step_type;
	this.layout_version = layout_version;


	this.set_data();
	this.set_content_html();
	this.set_nav_html();
  }

  //---------------------------------------------------------------------------
  set_data() {
	var selected_id = this.nav_list[this.nav_pos];
	if (typeof model.items_data[selected_id] == "undefined") {
		let item= new Object();
		var json = json_items_data[selected_id];
		if (typeof json != "undefined") {
			item.data=JSON.parse(json.replace(/\bNaN\b/g, "null"));
			item.status='parsed';
		}
		else { item.data=''}
		item.graphs=[];
		model.items_data[selected_id]=item;
	}
	this.data = model.items_data[selected_id].data;
	this.data.layout_version=this.layout_version;
  }

  //---------------------------------------------------------------------------
  set_content_html() {
  	if (this.data == '') {return;}
	var selected_id = this.nav_list[this.nav_pos];
	var var_type = this.data.data.type;
	var contents = model.core.modal_boxes_prepare_contents(this.data);

	// necessary?
	for (var i = 0; i < contents.graphs.length; i++) {
		this.graphs.push(contents.graphs[i]);
	}
	for (var i = 0; i < contents.datatables.length; i++) {
		this.datatables.push(contents.datatables[i]);
	}
	this.content_html = contents.html;
	this.content_class = contents.content_class;
  }

  //---------------------------------------------------------------------------
  set_nav_html() {
	var html=[];
	html.push('<ul>');
	for (var i = 0; i < this.nav_desc_list.length; i++) {
		html.push('<li class="modal_box_item" pos="'+i+'">');
		html.push(this.nav_desc_list[i]);
		html.push('</li>');
	}
	html.push('</ul>');
	this.nav_html = html.join('');
  }

  //---------------------------------------------------------------------------
  attach_content_html() {
	this.elem_content.innerHTML=this.content_html;
	this.elem_content.classList.add(this.content_class);
  }

  //---------------------------------------------------------------------------
  show_content_assets(when='now',graph_animation=true) {
	for (var i = 0; i < this.graphs.length; i++) {
		if (typeof this.graphs[i].options2 == 'object') {
			console.log(this.graphs[i].html_element_id);
			setTimeout(()=>{
			console.log(this.graphs[i].options2);
			this.graphs[i].options2.init(document.getElementById(this.graphs[i].html_element_id), null,{renderer: 'svg'});
			}, 200);
		}
		else {
		this.graphs[i].options.animation=graph_animation;
		if (graph_animation==true) this.graphs[i].options.animationDelay=200;
		if (when=='now') showGraphNow(this.graphs[i]);
		else showGraph(this.graphs[i],when);

		}
	}
	//console.log(this.datatables);
	for (var i = 0; i < this.datatables.length; i++) {
		var table_obj = $('#'+this.datatables[i].html_element_id).DataTable({
					"dom": "t", buttons: [ 'csv' ],
					processing : false,
					scrollY: true ,scrollX:true,scroller:false,"paging":false,"autoWidth": false,
					"deferRender": true,"searchDelay": 250,"stripeClasses": [ ],"order": []
				});
				/*

					"dom": "fBritS", buttons: [ 'csv' ],
					processing : true,
					scrollY: "100vh" ,scrollX:true,scroller:true,"paging":true,"autoWidth": false,
					"deferRender": true,"searchDelay": 250,"stripeClasses": [ ],"order": []


		var table_obj = $('#'+this.datatables[i].html_element_id).DataTable({
				"dom": "t",
				scrollY: "33%" ,scrollX:true,"zautoWidth": false,"order": [],
				"deferRender": true,"searchDelay": 250,"stripeClasses": [ ]
		});*/
		this.datatables[i].table_obj=table_obj;
	}
  }

  //---------------------------------------------------------------------------
  refresh_content_assets() {
	for (var i = 0; i < this.graphs.length; i++) {
		refreshGraphNow(this.graphs[i]);
	}
  }

  //---------------------------------------------------------------------------
  dettach_content_html() {
	this.elem_content.innerHTML='';
	this.elem_content.classList.remove(this.content_class);
  }

  //---------------------------------------------------------------------------
  destroy_content_assets() {
  	console.log('destroy');
	for (var i = 0; i < this.graphs.length; i++) {
		disposeGraph(this.graphs[i]);
	}
	for (var i = 0; i < this.datatables.length; i++) {
		//console.log(this.datatables[i].table_obj);
		this.datatables[i].table_obj.destroy();
	}
	this.graphs=[];
	this.datatables=[];
  }

  //---------------------------------------------------------------------------
  attach_nav_html() {
	this.elem_nav_panel.innerHTML=this.nav_html;
  }

  //---------------------------------------------------------------------------
  dettach_nav_html() {
	this.elem_nav_panel.innerHTML='';
  }

  //---------------------------------------------------------------------------
  change_item(item_pos) {
  	if (this.nav_pos==item_pos) return;
	let step_c = 0;
	console.time('change_item()');

 	console.time('change_item(1)');
 	this.destroy_content_assets();
	console.timeEnd('change_item(1)');

	step_c = 2;console.time('change_item('+step_c+')');
 	this.dettach_content_html();
 	this.elem_nav_panel.firstChild.childNodes[this.nav_pos].classList.remove("active");
 	this.elem_nav_panel.firstChild.childNodes[item_pos].classList.add("active");
 	this.nav_pos=parseInt(item_pos);
 	this.set_data();

 	this.set_content_html();
	console.timeEnd('change_item('+step_c+')');

	step_c = 3;console.time('change_item('+step_c+')');
 	this.attach_content_html();
	console.timeEnd('change_item('+step_c+')');
	step_c = 4;console.time('change_item('+step_c+')');
 	this.show_content_assets(0,false);
	console.timeEnd('change_item('+step_c+')');
	step_c = 5;console.time('change_item('+step_c+')');


 	var parent_height = this.elem_nav_panel_height;
	//var offsetTop = this.elem_nav_panel.firstChild.childNodes[item_pos].offsetTop; // blottleneck
 	//offsetTop = offsetTop - this.elem_nav_panel.firstChild.childNodes[0].offsetTop; // blottleneck
	var offsetTop = (item_pos*this.nav_elem_height);
	//var offsetHeight = this.elem_nav_panel.firstChild.childNodes[item_pos].offsetHeight; // blottleneck
	var offsetHeight = this.nav_elem_height;

	if (this.valid_scroll_pos == false) {
		console.log('mirar_scroll');
		this.scroll_pos=this.elem_nav_panel.scrollTop;
		this.valid_scroll_pos=true;
	}

	this.disable_scroll_event=true;
 	if ((offsetTop-this.scroll_pos) < (0.16*parent_height)-offsetHeight) {
 		this.elem_nav_panel.scrollTop = offsetTop-(0.16*parent_height)+offsetHeight;
		this.scroll_pos = offsetTop-(0.16*parent_height)+offsetHeight;
 	}
 	else if ((offsetTop-this.scroll_pos) > (0.84*parent_height)) {
 		this.elem_nav_panel.scrollTop = offsetTop-(0.84*parent_height);
		this.scroll_pos = offsetTop-(0.84*parent_height);
 	}
	setTimeout(()=>{
		this.disable_scroll_event=false;
	}, 0);


	console.timeEnd('change_item('+step_c+')');
	console.timeEnd('change_item()');
  }

  //---------------------------------------------------------------------------
  show_modal() {
	this.attach_nav_html();
	this.attach_content_html();
	this.elem_nav_panel.firstChild.childNodes[this.nav_pos].classList.add("active");
	this.elem_container.style.opacity=1;
	this.elem_container.style.display = "flex";
	//this.elem_box.classList.add("shown");
	this.show_content_assets(0,true);
	this.elem_container.focus();
	controller.set_modal_active(true);
	this.elem_nav_panel_height = this.elem_nav_panel.clientHeight;

 	// +1 because of the bottomborder
	this.nav_elem_height=this.elem_nav_panel.firstChild.childNodes[0].clientHeight+1;

	this.scroll_pos = (this.nav_pos*30)-(this.nav_elem_height*(this.nav_pos!=0));
	this.elem_nav_panel.scrollTop = this.scroll_pos;
	setTimeout(function() {
		let elem_box = document.getElementById('a3');
		elem_box.classList.add("shown");
	}, 0);
  }

  //---------------------------------------------------------------------------
  close() {
  	controller.set_modal_active(false);
	this.elem_box.classList.remove("shown");
	this.elem_container.style.opacity=0;
	setTimeout(()=>{
		this.elem_container.style.display = "none";
		this.destroy_content_assets();
		this.dettach_nav_html();
		this.dettach_content_html();
	},300);
  }

}
//---------------------------------------------------------------------------

// Color mapper
//-----------------------------------------------------------------------------

class color_mapper {

	constructor(params) {
		if (params.type == null) {
			this.get_color = function(data) { return '';}
			return;
		}

		this.type = params.type;
		this.data_list = params.data_list;
		this.color_list = params.color_list;
		this.column = params.column;

		// this.get_ref_value = function(data_list,columns) { return '';}
		// If there is a default condition
		if (this.data_list[params.data_list.length-1]==null) {
			this.condition_count = params.data_list.length-1;
			this.default_color = this.color_list[params.data_list.length-1];
		}
		else {
			this.condition_count = params.data_list.length;
			this.default_color = '';
		}

		if (this.type == 'color_codes') {
			this.get_color = function(data,prefix='') {
		    	return data;
			}
		}
		else if (this.type == 'numeric') {
			this.get_color = function(data,prefix='') {
				for (var i = 0; i < this.condition_count; i++) {
				    if (data <= this.data_list[i]) {
				    	if (this.color_list[i] === '') {
					    	return this.color_list[i];
				    	}
				    	return prefix+this.color_list[i];
				    }
				}
		    	if (this.default_color === '') {
			    	return this.default_color;
		    	}
		    	return prefix+this.default_color;
			}
		}
		else {
			this.get_color = function(data,prefix='') {
				for (var i = 0; i < this.condition_count; i++) {
				    if (data == this.data_list[i]) {
				    	if (this.color_list[i] === '') {
					    	return this.color_list[i];
				    	}
				    	return prefix+this.color_list[i];
				    }
				}
		    	if (this.default_color === '') {
			    	return this.default_color;
		    	}
		    	return prefix+this.default_color;
			}
		}

	}
}



//---------------------------------------------------------------------------
// CORE: Field renderer
//---------------------------------------------------------------------------
class field_renderer {
	constructor(params) {

		this.type=params.type;
		this.data_type=params.data_type;
		if (typeof params.set_data == 'undefined') this.set_data=function() {};
		else this.set_data=params.set_data;
		if (typeof params.init_renderer == 'undefined') this.init_renderer=function() {};
		else this.init_renderer=params.init_renderer;

		// Cell align and container options;
		this.container_class='';
		if (this.data_type == 'table') {
			if (typeof params.cell_align != 'undefined') {
				this.container_class+=' '+params.cell_align;
			}
			if (typeof params.container_css != 'undefined') {
				this.container_css=' '+params.container_css;
			}			
			if (this.container_class == '') this.pre='<td>';
			else this.pre='<td style="'+this.container_css+'" '+'class="'+this.container_class+'">';
			this.post='</td>';
		}
		else {
			this.pre='';
			this.post='';
		}

		switch (this.type) {
			case 'lite-modal':
				this.value_align=params.value_align;
				this.value_format=params.value_format;
				if (this.data_type == 'table') {
					this.set_data = function(table_data,row,col,column_positions) {
						let value = table_data[row][col];
						this.data= {
							label:value,
							modal_content:'',
							graphs: []
						};
					}
				}
				this.render = function() {
					let html = '';
					html+='<div class="lite-modal-button">';
					html+=this.data.label;
					html+='</div>';
					html+='<div class="lite-modal" tabindex="-1">';
					html+='<div class="modal_box">';
					html+='<div class="modal_utils">';
					html+='<span class="modal_close"></span>';
					html+='</div>';
					html+='<div class="modal_main_contents">';
					html+=this.data.modal_content;
					html+='</div>';
					html+='</div>';
					html+='</div>';
					return this.pre+html+this.post;
				}
				break;			
			case 'num':
				this.value_align=params.value_align;
				this.value_format=params.value_format;
				if (this.data_type == 'table') {
					this.set_data = function(table_data,row,col,column_positions) {
						let value = table_data[row][col];
						this.data= {
							value:value,
							value_formated:this.value_format.format(value),
						};
					}
				}
				this.render = function() {
					return this.pre+this.data.value_formated+this.post;
				}
				break;
			case 'bar':
				this.container_css=params.container_css;
				this.value_position=params.value_position;
				this.value_align=params.value_align;
				this.value_format=params.value_format;
				this.value_css_class=params.value_css_class;
				this.value_max=params.value_max;
				this.value_color_map=params.value_color_map;
				this.bar_width=params.bar_width;
				this.bar_color_map=params.bar_color_map;
				if (this.data_type == 'table') {
					this.set_data = function(table_data,row,col,column_positions) {
						let value = table_data[row][col];
						this.data= {
							value:value,
							value_formated:this.value_format.format(value),
						};
					}
				}
				this.render = function() { return this.render_field_bar();}
				break;
			case 'twobars':
				this.value_position=params.value_position;
				this.value_align=params.value_align;
				this.value_format=params.value_format;
				this.value_min=params.value_min;
				this.value_max=params.value_max;
				this.value_color_map=params.value_color_map;
				this.bar_width=params.bar_width;
				this.bar_color_map=params.bar_color_map;
				if (this.data_type == 'table') {
					this.set_data = function(table_data,row,col,column_positions) {
						let value = table_data[row][col];
						this.data= {
							value:value,
							value_formated:this.value_format.format(value),
						};
					}
				}
				this.render = function() { return this.render_field_twobars();}
				break;
		}
	}

	// Bar renderer;
	render_field_twobars() {
		var html = '';
		let fill_width=(this.data.value/this.value_max)*100;
		let label='';
		switch (this.value_position) {
			case 'top':
				label='<div class="'+this.value_align+'"">'+this.data.value_formated+'</div>';
				html+=label;
				html+='<div style="width:'+this.bar_width+';height:25%;background-color:#39495c;">';
				html+='<div style="height:100%;width:'+fill_width+'%px;background-color:#69b0e4;">';
				html+='</div>';
				html+='</div>';
				break;
			case 'left':
				label='<div style="width:25%;min-width:min-content;" class="'+this.value_align+'"">'+this.data.value_formated+'</div>';
				html+='<div style="display:flex;flex-wrap:no-wrap;justify-content:space-between;align-items:center;">';
				html+=label;
				html+='<div style="width:'+this.bar_width+';flex-grow:1;margin-left:5px;height:8px;background-color:#39495c;">';
				html+='<div style="height:100%;width:'+fill_width+'%;background-color:#69b0e4;">';
				html+='</div>';
				html+='</div>';
				html+='</div>';
				break;
			case 'right':
				label='<div style="width:25%;min-width:min-content;" class="'+this.value_align+'"">'+this.data.value_formated+'</div>';
				html+='<div style="display:flex;flex-wrap:no-wrap;justify-content:space-between;align-items:center;">';
				html+='<div style="width:'+this.bar_width+';flex-grow:1;margin-right:5px;height:8px;background-color:#39495c;">';
				html+='<div style="height:100%;width:'+fill_width+'%;background-color:#69b0e4;">';
				html+='<div style="width:'+this.bar_width+';flex-grow:1;margin-right:5px;height:8px;background-color:#39495c;">';
				html+='<div style="height:100%;width:'+fill_width+'%;background-color:#69b0e4;">';
				html+='</div>';
				html+='</div>';
				html+=label;
				html+='</div>';
				break;
		}
		return this.pre+html+this.post;
	}

	// Bar renderer;
	render_field_bar() {
		var html = '';
		let fill_width=(this.data.value/this.value_max)*100;
		let label='';
		let bar_color;
		if (typeof this.bar_color_map == 'undefined') bar_color='b_blue_1';
		else bar_color = this.bar_color_map.get_color(this.data.value,'b_');
		
		switch (this.value_position) {
			case 'top':
				label='<div class="'+this.value_css_class+' '+this.value_align+'"">'+this.data.value_formated+'</div>';
				html+=label;
				html+='<div style="width:'+this.bar_width+';height:14%;background-color:#39495c;">';
				html+='<div style="height:100%;width:'+fill_width+'%;" class="'+bar_color+'">';
				html+='</div>';
				html+='</div>';
				break;
			case 'left':
				label='<div style="width:25%;min-width:min-content;" class="'+this.value_css_class+' '+this.value_align+'"">'+this.data.value_formated+'</div>';
				html+='<div style="display:flex;flex-wrap:no-wrap;justify-content:space-between;align-items:center;">';
				html+=label;
				html+='<div style="width:'+this.bar_width+';flex-grow:1;margin-left:5px;height:8px;background-color:#39495c;">';
				html+='<div style="height:100%;width:'+fill_width+'%;" class="'+bar_color+'">';
				html+='</div>';
				html+='</div>';
				html+='</div>';
				break;
			case 'right':
				label='<div style="width:25%;min-width:min-content;" class="'+this.value_css_class+' '+this.value_align+'"">'+this.data.value_formated+'</div>';
				html+='<div style="display:flex;flex-wrap:no-wrap;justify-content:space-between;align-items:center;">';
				html+='<div style="width:'+this.bar_width+';flex-grow:1;margin-right:5px;height:8px;background-color:#39495c;">';
				html+='<div style="height:100%;width:'+fill_width+'%;" class="'+bar_color+'">';
				html+='</div>';
				html+='</div>';
				html+=label;
				html+='</div>';
				break;
		}
		return this.pre+html+this.post;
	}
}




//---------------------------------------------------------------------------
// CORE: GRMlab
//---------------------------------------------------------------------------
function GRMlab() {};
GRMlab.prototype.module_name="GRMlab_core";

GRMlab.prototype.general_summary = false;

//---------------------------------------------------------------------------

GRMlab.prototype.__table_count_by_column = function(data,columns,column_name,sort=false,prev_results=null){

	let counts = {};
	let result = {};
    let column_pos=columns.indexOf(column_name);
    if (prev_results != null) {
	    for (let j = 0; j < prev_results.labels.length; j++){
	        counts[prev_results.labels[j]]=prev_results.counts[j]
	    }    	
    }

    for (let j = 0; j < data.length; j++){
        counts[data[j][column_pos]]=(counts[data[j][column_pos]] || 0)+1;
    }

    if (sort == true) {
	    result.labels = Object.keys(counts).sort();
	    result.counts = [];
	    for (let j = 0; j < result.labels.length; j++){
	        result.counts.push(counts[result.labels[j]]);
	    }	
    }
    else {
    	result.labels= Object.keys(counts);
    	result.counts= Object.values(counts);    	
    }
    return result;    
}
//---------------------------------------------------------------------------
GRMlab.prototype.item_collect_data = function(item_id) {
	let item = {};
	// Was the item data previously collected or processed?
	if (typeof model.items_data[item_id] == "undefined") {

			// Mantain the original data (flexibility & backwrd compatibility)
			item.data=JSON.parse(json_items_data[item_id]);

			item.status='parsed';
			item.id=item.data.item_id;
			item.type=item.data.item_type;
			if (item.data.item_type == 'preprocessingdatastream')
			{
				item.core= 'preprocessing';
			}
			else item.core=item.data.item_type;
			item.layout_version=item.data.item_layout_version;

			// Get the data for each step
			item.steps={};
			for (let i = 0; i < item.data.item_steps.length; i++) {
				let step = {};
				step.pos=i;			
				step.status='parsed';	
				step.id=item.data.item_steps[i].step_id;
				step.type=item.data.item_steps[i].step_type;
				step.contents=item.data.item_steps[i].step_contents;
				for (let j = 0; j < step.contents.length; j++) {
					let element=step.contents[j];
					element.pos=j;
					element.type=element.content_type;
					delete element.content_type;
					for (let k = 0; k < element.content_blocks.length; k++) {
						element.content_blocks[k].pos=k;
						element.content_blocks[k].type=element.content_blocks[k].block_type;
						delete element.content_blocks[k].block_type;
					}
				}
				step.graphs=[];
				step.datatables=[];
				step.html='';

				item.steps[item.data.item_steps[i].step_id]=step;
			}

			// Save the item in the Model
			model.items_data[item_id]=item;

			// Clear json_items_data to reduce the memory footprint
			json_items_data[item_id]=null;
		}
	else item = model.items_data[item_id];
	return item;
}
//---------------------------------------------------------------------------
GRMlab.prototype.step_process_custom = function(item,step_id) {
	return null;
}

GRMlab.prototype.step_process = function(item,step_id) {
	let step = item.steps[step_id];
	if (step.status!='processed') {		

		let contents= this.step_process_custom(item,step_id);
		if (contents != null) return;

		let layout_parts=create_step_layout_parts(item);	
		// Render step elements
		for (let i = step.contents.length-1; i >= 0; i--) {
			let element = step.contents[i];
			layout_parts[element.content_position]+=this.element_render(item,step,element);
		}
		let step_html=join_step_layout_parts(item,layout_parts);
		step.html='<div class="step '+item.type+' '+step.type+'">'+step_html+'</div>';		
		step.status='processed';			
	}	
}

// -----------------------------------------------------------------------------------------------------
GRMlab.prototype.element_render = function(item,step,element) {
	let element_content='';
	for (let i = 0; i < element.content_blocks.length; i++) {
		let block = element.content_blocks[i];
		element_content += this.block_render(item,step,element,block);
	}

	let html='';
	html+='<div class="element regular '+item.type+' '+step.type+' '+element.type+'">';
	html+= element_content;		
	html+='</div>';
	return html;		
}

//---------------------------------------------------------------------------
GRMlab.prototype.block_render_custom = function(item,step,element,block) {
	return null;
}

// -----------------------------------------------------------------------------------------------------
GRMlab.prototype.block_render_big_numbers= function(options) {
	let html ='';
	let title = options.title;
	let table_css_class = options.params.table_css_class==null ? '' : options.params.table_css_class;
	let labels = options.data.labels;
	let values = options.data.values;
	let num_labels=labels.length;
	let big_elements=Math.min(num_labels,options.params.big_elements);
	let small_elements=Math.min(num_labels-big_elements,options.params.small_elements ==null ? num_labels:options.params.small_elements );

	if (title!=null) {
	    html += '<div><h1 class="title">'+title+'</h1></div>';   
	}

	if (big_elements > 0 || small_elements > 0) {
		html+='<div class="block_big_number">';
		if (big_elements > 0) {
	    	html += '<div class="big_numbers">';
			// Render big numbers
			for (let i = 0; i < big_elements; i++) {
			    html += '<div class="big_number">';
				html+='<span class="value">'+fmt_int.format(values[i])+'</span>';
				html+='<br/>';
				html+='<span class="prop">'+labels[i]+'</span>';
				html+='</div>';
			}
			html+='</div>';
		}
		if (big_elements<num_labels) {
			html+='<div class="block_table '+table_css_class+'">';
			html+='<table>';
			for (let i = big_elements; i < big_elements+small_elements; i++) {
				html+='<tr><td>'+labels[i]+'</td><td class="value">';
				let value=fmt_num_basic.format(values[i]);
				if (isNaN(value)) value=values[i];
				html+=value;
				html+='</td></tr>';
			}
			html+='</table>';
			html+='</div>';
		}
		html+='</div>';
	}
	return html;
}
GRMlab.prototype.block_render_datatable= function(item,step,element,block) {
	console.time('___block_render_datatable()');	
	let html ='';

	html+='<div class="block_summary">';
	if (get_block_description(block.type) != '') {
		html+='<h1 class="block_title">'+get_block_description(block.type);
		html+='</h1>';			
	}

	let scope = {
			item_type:item.type,item_id:item.id,
			step_type:step.type,step_id:step.id,
			element_type:element.type,element_pos:element.pos,
			block_pos:block.pos,
			place_type:'datatable'
		};
	let datatable= this.datatables_prepare_datatable(block.block_data,scope);
	step.datatables.push(datatable);
	html+=datatable.html;
	html+='</div>';	
	console.timeEnd('___block_render_datatable()');	
	return html;
}

GRMlab.prototype.block_render_table= function(options) {
	//console.log(options);
	let html ='';
	let title = options.title;
	let table_css_class,table_css_style,num_elements=99999;

	if (typeof options.params != 'undefined') {
		table_css_class = options.params.table_css_class==null ? '' : options.params.table_css_class;
		table_css_style = options.params.table_css_style==null ? '' : options.params.table_css_style;
		num_elements = options.params.num_elements==null ? 99999 : options.params.num_elements;
	}
	let labels = options.data.labels;
	let values = options.data.values;
	let num_labels=labels.length;
	num_elements=Math.min(num_labels,num_elements);

	if (title!=null) {
	    html += '<div><h1 class="title">'+title+'</h1></div>';   
	}

	if (num_elements>0) {
		html+='<div style="'+table_css_style+'" class="block_table '+table_css_class+'">';
		html+='<table>';
		for (let i = 0; i < num_elements; i++) {
			html+='<tr><td>'+labels[i]+'</td><td class="value">';
			let value=fmt_num_basic.format(values[i]);
			if (isNaN(value)) value=values[i];
			html+=value;
			html+='</td></tr>';
		}
		html+='</table>';
		html+='</div>';
	}
	return html;
}

GRMlab.prototype.block_render_table_actions= function(options) {
	//console.log(options);
	let html ='';
	let title = options.title;
	let table_css_class,table_css_style,num_elements=99999;

	if (typeof options.params != 'undefined') {
		table_css_class = options.params.table_css_class==null ? '' : options.params.table_css_class;
		table_css_style = options.params.table_css_style==null ? '' : options.params.table_css_style;
		num_elements = options.params.num_elements==null ? 99999 : options.params.num_elements;
	}
	let labels = options.data.labels;
	let values = options.data.values;
	let num_labels=labels.length;
	num_elements=Math.min(num_labels,num_elements);

	if (title!=null) {
	    html += '<div><h1 class="title">'+title+'</h1></div>';   
	}

	if (num_elements>0) {
		html+='<div class="block_table '+table_css_class+'">';
		html+='<table>';
		for (let i = 0; i < num_elements; i++) {
	        switch(labels[i]){
	            case "keep":
	                html += '<tr><td class = "icon_check color_ok">&nbsp;<span class="grey">'  + labels[i] + '</td><td class="color_ok" style="font-weight: bold;">' + values[i] + '</td></tr>';
	                break;
	            case "remove":
	                html += '<tr><td class = "icon_cross color_rm">&nbsp;<span class="grey">' + labels[i] + '</td><td class="color_rm" style="font-weight: bold;">' + values[i] + '</td></tr>';
	                break;
	            case "transform":
	                html += '<tr><td class = "icon_tool color_normal">&nbsp;<span class="grey">' + labels[i] + '</td><td class="color_tr" style="font-weight: bold;">' + values[i] + '</td></tr>';
	                break;
	            case "review":            
	                html += '<tr><td class = "icon_review color_tr">&nbsp;<span class="grey">' + labels[i] + '</td><td class="color_tr" style="font-weight: bold;">' + values[i] + '</td></tr>';
	                break;	                
	            default:
	                html += '<tr><td style="text-align:left">' + labels[i] + '</td><td class="value">' + values[i] + '</td></tr>';
	                break;
	        };
		}
		html+='</table>';
		html+='</div>';
	}
	return html;
}

// -----------------------------------------------------------------------------------------------------
GRMlab.prototype.get_icon = function(string,container) {
    let result = {color_class:'',icon_class:'',html:''}
    switch (string) {
        case 'keep': 
            result.icon_class='icon_check'; 
            result.color_class='color_ok';
            break;
        case 'remove': 
            result.icon_class='icon_cross';
            result.color_class='color_rm';
            break;
        case 'transform': 
        case 'repair': 
            result.icon_class='icon_tool';
            result.color_class='color_normal';
            break;
        case 'warning': 
        case 'review': 
            result.icon_class='icon_review';
            result.color_class='color_tr';
            break;
    }        
    if (container) {
        result.html='<span class="'+result.icon_class+' '+result.color_class+'"></span>';
    }
    else {
        result.html='';            
    }
    return result;
}

// -----------------------------------------------------------------------------------------------------
GRMlab.prototype.block_render = function(item,step,element,block) {

	let html = this.block_render_custom(item,step,element,block);
	if (html != null) return html;
	else html = '';

	switch (block.type) {
		case 'db_info': 		
		case 'db_info_expanded': 
		    let block_options = 
	            {
	                title: get_block_description(block.type),
	                params: {
	                    big_elements:2,
                    	table_css_class: 'no_border'
	                },
	                data:{
	                    labels:block.block_data.index,
	                    values:block.block_data.data
	                }
	            };
			return this.block_render_big_numbers(block_options);
		case 'column_analysis':
		case 'results':
		case 'details':
		case 'block_analysis': 	
		case 'model_analysis': 	
			return render_block_table(item,step,element,block);
		case 'duplicates_analysis':
			return render_block_table(item,step,element,block);
		case 'parameters':
		case 'config': 			
			return render_block_config(item,step,element,block);
		case 'cpu_time': 		
			return render_block_piechart(item,step,element,block);
		case 'table': 			
		case 'table_num_ord':
		case 'table_cat_nom':
			return this.block_render_datatable(item,step,element,block);
		default:
			return render_block_raw(item,step,element,block);
	}
}

//---------------------------------------------------------------------------
GRMlab.prototype.assign_field_renderer = function(field_name,scope,data_type) {

	let renderer= this.assign_field_renderer_custom(field_name,scope,data_type);
	if (renderer != null) return renderer;
	// backward compatibility

	renderer = assing_col_render(scope.item_type,scope.step_type,'',field_name);	
	if (renderer.name != 'raw' || renderer instanceof field_renderer) return renderer;
	
	renderer = new Object();
	renderer.name='';
	renderer.class='';
	renderer.format_number = '';
	renderer.color_map = new color_mapper({type:null});

	switch (field_name) {
		default: renderer.name='raw';break;
	}
	return renderer;
}

GRMlab.prototype.assign_field_renderer_custom = function(field_name,scope,data_type) {
	return null;
}

//---------------------------------------------------------------------------
GRMlab.prototype.datatables_prepare_html = function(table_data,summary_columns,column_positions,id,scope) {
	//input: 	table_data: {columns:[],data:[]}
	//			summary_columns: [{pos:int,name:string}]
	//			column_positions: {}
	//			id: string
	//			scope: {}
	let html='';
	let cols=table_data.columns;
	let data=table_data.data;
	const num_columns=cols.length;
	const num_rows=data.length;

	html+='<table id="'+id+'" class="">';
	html+='<thead><tr>';
	for (var i = 0; i < num_columns; i++) {
		// Original column name, not lowercase
		var col_name = cols[i];
		var col_renderer = summary_columns[i].renderer;
		if (col_renderer.name != 'none') {
			html+=get_col_header(col_name,scope.item_type,scope.step_type,scope.place_type);
		}
	}
	html+='</tr></thead>';
	html+='<tbody>';
	for (var row_i = 0; row_i < num_rows; row_i++) {
		html+='<tr>';
		for (var col_i = 0; col_i < num_columns; col_i++) {
			let details_id = scope.item_id +'_'+scope.step_id+'_'+scope.element_pos+'_'+scope.block_pos;
			if (summary_columns[col_i].renderer instanceof field_renderer) {
				summary_columns[col_i].renderer.set_data(data,row_i,col_i,column_positions);
				html+=summary_columns[col_i].renderer.render();
			}
			// backward compatibility
			else html+=apply_col_render(summary_columns[col_i].renderer,data[row_i],col_i,column_positions,row_i,details_id);
		}
		html+='</tr>';
	}
	html+='</tbody>';
	html+='</table>';
	return html;
}

GRMlab.prototype.datatables_prepare_datatable = function(table_data,scope,options={}) {
	let table = {};
	//console.log(table_data);
	table.html_element_id='table_'+Math.random().toString(36).substr(2, 12);
	table.indexed_list = new Object();
	table.indexed_desc_list = new Object();
	table.options=options;

	const num_columns=table_data.columns.length;
	const num_rows=table_data.data.length;

	let summary_columns= [];
	let column_positions= new Object();
	for (var i = 0; i < num_columns; i++) {
		var column= new Object();
		column.pos=i;
		column.name=table_data.columns[i].toLowerCase();
		summary_columns.push(column);
		column_positions[column.name]=column.pos;
	}

	for (var i = 0; i < num_columns; i++) {
		// assign renderer for each column
		summary_columns[i].renderer=this.assign_field_renderer(summary_columns[i].name,scope,'table');
		// backward compatibility
		// init render (pre-calculate data)
		if (summary_columns[i].renderer instanceof field_renderer) {
			summary_columns[i].renderer.init_renderer(table_data.data,column_positions);
		}
	}

	for (var i = 0; i < num_columns; i++) {
		// Linked_variable --> Generate indexed list of rows for
		//   navigation purposes (modal boxes)
		if (summary_columns[i].renderer.name == 'linked_variable') {
			for (var j = 0; j <= num_rows-1; j++) {
				table.indexed_list[j]= scope.item_id +'_'+scope.step_id+'_'+scope.element_pos+'_'+scope.block_pos+'_'+table_data.data[j][i];
				table.indexed_desc_list[j]= table_data.data[j][i];
			}
		}		
	}

	table.html=this.datatables_prepare_html(table_data,summary_columns,column_positions,table.html_element_id,scope);
	return table;
}

//---------------------------------------------------------------------------
GRMlab.prototype.echarts_prepare_html = function(id,scope) {
	//input: 	id: string
	//			scope: {}
	return '<div class="echart_chart" id="'+id+'"></div>';
}

GRMlab.prototype.echarts_prepare_chart = function(chart_options,scope) {
	let chart = {};
	chart.html_element_id='chart_'+Math.random().toString(36).substr(2, 12);
	chart.html=this.echarts_prepare_html(chart.html_element_id,scope);
	chart.options=chart_options;
	return chart;
}

//---------------------------------------------------------------------------
GRMlab.prototype.modal_boxes_prepare_contents = function(json) {
}

GRMlab.prototype.modal_boxes_html_title = function(v_data) {
	let html = '';
	html +='<h1 class="modal_title">'+v_data.name;
	if (v_data.version == '01') {
	html +='<span class="italic grey"> ('+v_data.type+')</span>';		
	}
	else if (v_data.version == '02') {
	html +='<span class="italic grey"> ('+v_data.dtype+')</span>';		
	}
	html +='</h1>';
	return html;
}

//---------------------------------------------------------------------------
// General summaries
//---------------------------------------------------------------------------

GRMlab.prototype.__gs_sidebar_2_actions = function (tables_data) {
    var html = '';

    let data=tables_data["data"];
    let columns=tables_data["columns"];

    let counts_pre = {};
    let counts = {};
    let final_counts = {};
    let result = {};
    let a_applied=columns.indexOf('action');
    let a_recommended=columns.indexOf('recommended_action');
    let a_user=columns.indexOf('user_action');
    let c_user=columns.indexOf('user_comment');
    let c_auto=columns.indexOf('auto_comment');

    // Preliminary counts_pre;
    for (let j = 0; j < data.length; j++){
        let group;
        //console.log(data[j]);
        if (data[j][a_recommended] == data[j][a_user]) {
            data[j][a_user]=null;
        }

        if (data[j][a_applied] != data[j][a_recommended]) {
            if (data[j][a_user] != 'null') group=3;
            else group=2;
        }
        else group=1;      

        let index = group + '#' + data[j][a_applied] + '#' +  data[j][a_recommended] + '#' + data[j][a_user]  + '#' + data[j][c_auto];
        if (typeof counts_pre[index] == 'undefined')  {
            counts_pre[index]=0;
        }
        counts_pre[index]+=1;
    }
    let counts_keys = Object.keys(counts_pre).sort();
    for (let j = 0; j < counts_keys.length; j++){
        counts[counts_keys[j]]=counts_pre[counts_keys[j]];
    }   

    // process counts and overrides;
    let keys = Object.keys(counts);
    for (let j = 0; j < keys.length; j++){
        let applied=keys[j].split('#')[1];
        let recommended=keys[j].split('#')[2];
        let user=keys[j].split('#')[3];
        let auto_comment=keys[j].split('#')[4];        
        if (typeof final_counts[applied] == 'undefined')  {
            final_counts[applied]={counts:0,overrides:[]};
        }
        final_counts[applied].counts+=counts[keys[j]];
        console.log(auto_comment);

        // Overrides;
        let override = {};        
        if (applied != recommended) {
            if (user != 'null') {
                override.from = recommended;
                override.to = user;
                override.by = 'user';
                override.count = counts[keys[j]];         
                override.key=keys[j];
            }
            else {
                override.from = recommended;
                override.to = applied;
                override.by = auto_comment;
                override.count = counts[keys[j]];
                override.key=keys[j];
            }
        }
        else { 
            override.from = recommended;
            override.to = applied;
            override.by = 'recommended';
            override.count = counts[keys[j]];
            override.key=keys[j];
        }  
        final_counts[applied].overrides.push(override);
    }

    //console.log(counts);
    //console.log(final_counts);

    html += '<div class="block_table">';
    html += '<table>';
    let final_keys = Object.keys(final_counts);
    for(let i = 0; i < final_keys.length; i++){
        html += '<tr>';
        html += '<td>' + this.get_icon(final_keys[i],'span').html + ' ';

            html += '<div class="tooltip '+'val_class'+' '+'color_class'+'">';
            html += '<span onmouseover="mouseOver_tooltip(this)" class="du">' +''+ final_keys[i] + '</span>';
            html += '<div class="fix">';
            html += '<span style="left:0px;" class="tooltiptext">'+'<span class="b f13 ">';

            // overrides        
            for(let j = 0; j < final_counts[final_keys[i]].overrides.length; j++){
                let override=final_counts[final_keys[i]].overrides[j];
                html += '<div>';
                html += '<table>';
                html += '<tr>';
                html += '<td style="border-width:0px;padding-left:25px;">';
                if (override.by == 'user') {
                        html += 'from ' + this.get_icon(override.from,'span').html;
                        html += ' to ' + this.get_icon(override.to,'span').html;
                        html += ' by ' + override.by;                    
                }
                else if (override.by != 'recommended') {
                        html += 'from ' + this.get_icon(override.from,'span').html;
                        html += ' to ' + this.get_icon(override.to,'span').html;
                        html += ' by ' + override.by;                    
                }
                else {
                        html += ' ' + this.get_icon(override.from,'span').html;
                        html += ' recommended ';
                }                
                html += '</td>';
                html += '<td style="border-width:0px;">' + override.count + '</td>';
                html += '</tr>';
                html += '</table>';
                html += '</div>';
            }

            html += '</span></span>';
            html += '</div>';
            html += '</div>';

        html += '</td>';
        html += '<td style="font-weight:bold;" class="'+ this.get_icon(final_keys[i],'span').color_class+'">' + final_counts[final_keys[i]].counts + '</td>';
        html += '</tr>';
    };
    html += '</table>';
    html += '</div>';

    return html;
};





//---------------------------------------------------------------------------
//https://www.sitepoint.com/call-javascript-function-string-without-using-eval/
//https://ourbrand.BPexperience.com/private/colores/


// Todo: improve model selected id -> assest ->
//         dispose and remove queue
//         on resize event for maincontainer

/*
// -----------------------------------------------------------------------------------------------------
function pickHex(color1, color2, weight) {
  //https://krazydad.com/tutorials/makecolors.php
	var w1 = weight;
	var w2 = 1 - w1;
	var rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
		Math.round(color1[1] * w1 + color2[1] * w2),
		Math.round(color1[2] * w1 + color2[2] * w2)];
	return rgb;
}

		$('#sidebar').on('click', 'a', function(e) {
			let clicked_target= this.getAttribute('href').substr(1);
			if (clicked_target!='frontpage'){
				window.pJSDom[0].pJS.particles.move.enable = false;
				elem_particles.style.display = "none";
				elem_loading.style.opacity=1;
			}
			//selected_element.style.animation = '1.1s ease 0s fadeout';
			selected_element.style.display = 'none';
			setTimeout(function() {change_item(clicked_target);}, 0);
		});
*/