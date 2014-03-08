var DROPBOX_APP_KEY = 'wy9kcn6i5kkgrrf';
var client = new Dropbox.Client({key: DROPBOX_APP_KEY});
var Table;
var idn, old_idn;
var isNewNote;
var next_li, next_id;
var d = false;
var search_list = [];
$(function()
{
    function show_edit_page()
	{
	     $('#for_note').hide();
	     $('#for_edit').show();
	}
	function show_main_page()
	{
	     $('#for_note').show();
	     $('#for_edit').hide();
	}
	
	$('#cancel').click(function(e)
	{
		$('#child').hide();
	});
	
	$('#ok').click(function(e)
	{
		$('#n').show();
		$('#child').hide();
		$('#for_note').show();
		$('#panel').show();
		d=true;
		client.getDatastoreManager().openDefaultDatastore(function (error, datastore)
		{
			if (error) 
			{
				alert('Error opening default datastore: ' + error);
			}
			Table = datastore.getTable('Notes');
			form_search_list();
			updateList();
			datastore.recordsChanged.addListener(updateList);
			datastore.recordsChanged.addListener(form_search_list);
		});
	});
	
	$('#loginButton').click(function (e) 
	{
		e.preventDefault();
		client.authenticate();
	});

	client.authenticate({interactive:false}, function (error)
	{
		if (error) 
		{
			alert('Authentication error: ' + error);
		}
	});

	if (client.isAuthenticated()) 
	{
		$('#loginButton').hide();
	}
	
	function insertNote(text) 
	{
		Table.insert(
		{
			content: text,
			modified: getTime_and_Date(),
			number: get_number()
		});
	}
	
	function get_number()
	{
		var num, last;
		var rec = Table.query();
		if (rec.length>0)
		{
			last=rec[rec.length-1];
			num = last.get('number') + 1;
		}
		else num = 0;
		return num;
	}
	
	function updateList() 
	{
		$('#notes_list').empty();
		var records = Table.query();
		// Sort by creation time.
		records.sort(function (note_A, note_B) 
		{
			if (note_A.get('number') < note_B.get('number')) return -1;
			if (note_A.get('number') > note_B.get('number')) return 1;
			return 0;
		});
		if(records.length>0)
		{
			$('#em').hide();
			// Add an item to the list for each note.
			for (var i = 0; i < records.length; i++) 
			{
				var record = records[i];
				$('#notes_list').append(renderNote(record.getId(),record.get('content')));
			}
		}
		else 
		{
			$('#em').show();
			$('#for_note1').empty();
			$('#l1').empty();
		}
        $('#n').hide();
		addListeners();
		$('#newNote').focus();
	}
	
	function getNameString(content)
	{
		var n ='';
		if (content.length <= 25) n = content;
		else for (var i = 0; i < 25; i++) n = n + content[i];
		return n;
	}
	
	function renderNote(id, content)
	{
		return $('<li>').attr('id', id).append(
				$('<input>').addClass('ch').attr('type', 'checkbox').attr('checked', false)).append(
				$('<a>').addClass('cl').text(getNameString(content)));
	}
	
	function show_note(id)
	{ 
		$('#for_note1').empty();
		$('#l1').empty();
		$('#title').show();
		var records = Table.query();
		for (var i = 0; i < records.length; i++)
		{
			var record = records[i];
			if(record.getId()==id) 
			{
			    var n = record.get('content');
				$('#for_note1').text(n);
				$('#l1').text(getNameString(n));
				break;
			}
		}
	}
	
	function deleteRecord(id) 
	{
		Table.get(id).deleteRecord();
	}

	$('#add_note').click(function(e)
	{ 
		if(d)
		{
			isNewNote=true;
			$('#edit_time').empty();
			$('#newNote').val('');
			$('#newText').val('');
			show_edit_page();
		}
	});
	
	$('#edit_button').click(function(e)
	{
		edit_note(idn);
		show_edit_page();
	});
	
	$('#save').click(function(e)
	{
		if(!isNewNote) 
		{
			change_note(idn);
			show_note(idn);
		}	
		else add_new_note();
		show_main_page();
		isNewNote=false;
	});
		
	$('#exit').click(function(e)
	{
		show_main_page();
		if(!isNewNote)
			show_note(idn);
    });	
	
	$('#del_note').click(function (e)
	{ 
		var id_note;
		var dl = false;
		try
		{
		$('input.ch').each(function()
		{ 
			id_note=$(this).parents('li').attr('id');
			if($(this).prop('checked')==true)
			{
				deleteRecord(id_note);
				dl=true;
			}
		});
		}
		catch(e){alert(e);}
		if (dl)
		{
			$('#for_note1').empty();
			$('#l1').empty();
			$('#title').hide();
		}
	});
	
	function addListeners() 
	{
		$('li').click(function(e)
		{
			if(document.getElementById(old_idn)!=null)
				document.getElementById(old_idn).style.background = 'white';
			show_main_page();
			idn=$(this).attr('id');
			old_idn=idn;
			show_note(idn);
			document.getElementById(idn).style.background = 'gray';
		});		 
	} 
	
	$("#notes_list").sortable(
	{
		axis: 'y',
		stop: function (event, ui)
		{
			var li_id = $(ui.item).attr('id');
			var li_num = Table.get(li_id).get('number');
			try
			{
				var prev_li_id = $(ui.item).prev('li').attr('id');
				var i, j1, j2, ii, jj;
				var rec = Table.query();
				if(prev_li_id==undefined)//up
				{ 	
					j1=0; 
					j2 = li_num;
					ii=j1;
				}
				else
				{
					var prev_li_num = Table.get(prev_li_id).get('number');
					if(prev_li_num > li_num)//down
					{
						j1=li_num;
						j2=prev_li_num;
						ii=j1;			
					}
					else//up
					{
						j1=prev_li_num+1;
						j2=li_num;
						ii=j1;
					}
				}	
				var list = document.getElementById('notes_list');
				var node, node_id;
				var arr =[];
				for(i=j1; i<=j2; i++)
				{
					node =list.getElementsByTagName('li')[i];
					node_id= $(node).attr('id');
					arr.push(node_id);
				}
				for (i=0; i<arr.length; i++)
				{
					Table.get(arr[i]).set('number', ii)
					ii++;
				}
			}
			catch(e){alert(e);}
		}
	});

	function change_note(id)
	{ 
		if($('#newText').val().length>0)
		{
			Table.get(id).set('content', $('#newText').val());
			Table.get(id).set('modified',  getTime_and_Date());
		}
		else alert('text not found.');
		return false;
	}
	
	function edit_note(id)
	{
		$('#newText').val('');
		$('#edit_time').empty();
		var records = Table.query();
		for (var i = 0; i < records.length; i++)
		{
			var record = records[i];
			if(record.getId()==id) 
			{
				$('#newText').val(record.get('content'));
				$('#edit_time').append((record.get('modified')));
				break;
			}
		}
	}
	
	function add_new_note()
	{
		if($('#newText').val().length>0)
		{
			insertNote( $('#newText').val());
			$('#newText').val('');
		}
		else alert('text not found.');
		return false;
	}
	
	function getTime_and_Date()
	{
		var td = new Date();
		var hh = td.getHours();
		if (hh<10) hh = '0'+hh;
		var mm = td.getMinutes();
		if(mm<10) mm = '0'+mm;
		var day = td.getDate();
		if (day<10) day = '0'+day;
		var month = td.getMonth()+1;
		if (month<10) month = '0'+month;
		var year = td.getFullYear();
		var str = hh + ":" + mm +", " + day + "-" + month + "-" + year;
		return str;
	}
	
	function form_search_list()
	{
		search_list.length = 0;
		var rec = Table.query();
		var r, c, n;
		for(i=0; i<rec.length; i++)
		{
		    r=rec[i];
			c=r.get('content');
			n=r.get('number')+1;
			search_list.push(n+') '+getNameString(c));
		}
	}
	
	function show_note_by_num(num)
	{ 
		$('#for_note1').empty();
		$('#l1').empty();
		$('#title').show();
		var records = Table.query();
		for (var i = 0; i < records.length; i++)
		{
			var record = records[i];
			if(record.get('number')==num) 
			{
			    var n = record.get('content');
				$('#for_note1').text(n);
				$('#l1').text(getNameString(n));
				idn=record.getId();
				break;
			}
		}
	}
	
	$( "#search_note" ).autocomplete(
	{
		source: search_list, 
		close: function(event, ui)
		{ 
			try 
			{
				var j, i = 0;
				var str=$(this).val();
				if(str!='') 
				{	
					j=str.split(')')[0];
					j=parseInt(j)-1;
					if(document.getElementById(old_idn)!=null)
						document.getElementById(old_idn).style.background = 'white';
					show_main_page();
					show_note_by_num(j);
					old_idn=idn;
					document.getElementById(idn).style.background = 'gray';
				}
			} 
			catch(e){alert(e);}
		}
	});
	
	$('#clear_ch').click(function (e){$('#search_note').val('');});
	
});//$(function()
