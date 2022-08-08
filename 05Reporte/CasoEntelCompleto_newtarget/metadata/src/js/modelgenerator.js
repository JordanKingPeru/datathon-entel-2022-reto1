var modelgenerator = new GRMlab();
modelgenerator.module_name='modelgenerator';
modelgenerator.general_summary = false;

//---------------------------------------------------------------------------
modelgenerator.assign_field_renderer_custom = function(field_name,scope,data_type) {

    let renderer = new Object();
    renderer.name='';
    renderer.class='';
    renderer.format_number = '';
    renderer.color_map = new color_mapper({type:null});

    switch (field_name) {
        case 'description': 
            renderer.name='none';
            break;

        case 'feature_selection': 
            renderer= new field_renderer({
                type:'lite-modal',
                data_type:data_type,
            });
            renderer.set_data = function(table_data,row,col,column_positions) {
                let value = table_data[row][col];
                let data=table_data[row][column_positions['description']].feature_selection;
                let modal_content = '';
                modal_content += '<div>';
                modal_content += '<div><h1 class="title f13">Estimator details:</h1></div>';
                modal_content+='<div class="block_table">';
                modal_content+='<table>';
                modal_content+='<tr><td></td><td></td></tr>';
                let keys = Object.keys(data);
                for (let j = 0; j < keys.length; j++){                
                    modal_content+='<tr><td class="f12">'+keys[j]+'</td><td class="f12 value">';
                    modal_content += data[keys[j]];                   
                    modal_content+='</td></tr>';
                }
                modal_content+='</table>';
                modal_content+='</div>';
                modal_content += '</div>';

                this.data= {
                    label:value,
                    modal_content:modal_content,
                    };
                }
            break; 
        case 'estimator': 
            renderer= new field_renderer({
                type:'lite-modal',
                data_type:data_type,
            });
            renderer.set_data = function(table_data,row,col,column_positions) {
                let value = table_data[row][col];
                let data=table_data[row][column_positions['description']].estimator;
                let modal_content = '';
                modal_content += '<div>';
                modal_content += '<div><h1 class="title f14">Estimator details:</h1></div>';
                modal_content+='<div class="block_table">';
                modal_content+='<table>';
                modal_content+='<tr><td></td><td></td></tr>';
                let keys = Object.keys(data);
                for (let j = 0; j < keys.length; j++){                
                    modal_content+='<tr><td class="f13">'+keys[j]+'</td><td class="f13 value">';
                    modal_content += data[keys[j]];                   
                    modal_content+='</td></tr>';
                }
                modal_content+='</table>';
                modal_content+='</div>';
                modal_content += '</div>';
                this.data= {
                    label:value,
                    modal_content:modal_content,
                    };
                }
            break;            
        case 'n_features':
            renderer.name='numeric';
            renderer.format_number = fmt_int;
            break;
        case 'condition_number':
            renderer.name='numeric';
            renderer.format_number = fmt_dec_2;
            renderer.color_map = new color_mapper({
                type : 'numeric',
                data_list : [10,20,30,null],
                color_list : ['white_9','yellow_1','orange_1','red_1']
                });
            break;
        case 'max_corr':
            renderer.name='numeric';
            renderer.format_number = fmt_pct_2_2;
            renderer.color_map = new color_mapper({
                type : 'numeric',
                data_list : [0.5,0.6,0.7,null],
                color_list : ['white_9','yellow_1','orange_1','red_1']
                });
            break;        
        case 'auc_roc': 
            renderer.name='none';
            break;
        case 'auc_pr':
            renderer.name='numeric';
            renderer.class = 'b_group_4';
            renderer.format_number = fmt_pct_2_2;
            break;                
        case 'time_total':
        case 'time_feature_selection':
        case 'time_estimator':
            renderer.name='numeric';
            renderer.class = 'b_group_3';
            renderer.format_number = fmt_dec_3;
            break;
        case 'balanced_accuracy':
            renderer.name='numeric';
            renderer.class = 'b_group_4';
            renderer.format_number = fmt_pct_2_2;
            break;
        case 'balanced_error_rate':
            renderer.name='none';
            break;
        case 'cohen_kappa':
                renderer.name='numeric';
                renderer.class = 'b_group_4';
                renderer.format_number = fmt_dec_3;
                break;
        case 'diagnostic_odds_ratio':
                renderer.name='none';
                renderer.format_number = fmt_dec_1;
                break;
        case 'discriminant_power':
                renderer.name='numeric';
                renderer.class = 'b_group_4';
                renderer.format_number = fmt_dec_3;
                break;
        case 'f1_score':
                renderer.name='numeric';
                renderer.class = 'b_group_4';
                renderer.format_number = fmt_dec_3;
                break;
        case 'fpr':
        case 'fnr':
            renderer.name='none';
            renderer.format_number = fmt_dec_3;
            break;
        case 'geometric_mean':
            renderer.name='none'; 
            break;
        case 'gini':
            renderer= new field_renderer({
                type:'bar',
                data_type:'table',
                container_css:'padding:0px 5px;',
                cell_align:'right',
                value_position:'top',
                value_align:'left',
                value_max:1,
                value_format:fmt_pct_2_2,
                bar_width:'70px',
                bar_color_map:
                    new color_mapper({
                        type : 'numeric',
                        data_list : [0.25,0.45,null],
                        color_list : ['red_1','orange_1','blue_1']
                    }),
            });
            break;
        case 'positive_likelihood':
        case 'negative_likelihood':
            renderer.name='none';
            renderer.format_number = fmt_dec_3;
            break;
        case 'tpr': //sensitivity
        case 'tnr': //specificity
            renderer.name='none';
            renderer.format_number = fmt_pct_2_2;
            break;            
        case 'youden':
            renderer.name='numeric';
            renderer.class = 'b_group_5';
            renderer.format_number = fmt_dec_3;
            break;
    }
    if (renderer.name=='') return null;
    else return renderer;
}

