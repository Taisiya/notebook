var DROPBOX_APP_KEY = 'wy9kcn6i5kkgrrf';
var client = new Dropbox.Client({key: DROPBOX_APP_KEY});
var Table;
var idn;
var isNewNote;
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
		$('#edit_button').hide();
		client.getDatastoreManager().openDefaultDatastore(function (error, datastore)
		{
			if (error) 
			{
				alert('Error opening default datastore: ' + error);
			}
			Table = datastore.getTable('Notes');
			updateList();
			datastore.recordsChanged.addListener(updateList);
		});
	}
	
	function insertNote(text) 
	{
		Table.insert(
		{
			content: text,
			modified: getTime_and_Date()
		});
	}
	
	function updateList() 
	{
		$('#notes_list').empty();
		var records = Table.query();
		// Sort by creation time.
		records.sort(function (note_A, note_B) 
		{
			if (note_A.get('modified') < note_B.get('modified')) return -1;
			if (note_A.get('modified') > note_B.get('modified')) return 1;
			return 0;
		});
		if(records.length>0)
		{
			$('#em').hide();
			// Add an item to the list for each note.
			for (var i = 0; i < records.length; i++) 
			{
				var record = records[i];
				$('#notes_list').append(renderNote(record.getId(),record.get('content')));//name
			}
		}
		else 
		{
			$('#em').show();
			$('#edit_button').hide();
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
		if (content.length < 25) n = content;
		else for (var i = 0; i < 26; i++) n = n + content[i];
		return n;
	}
	
	function renderNote(id, content)
	{
		return $('<li>').attr('id', id).append(
				$('<input>').attr('type', 'checkbox').attr('checked', false)).append(
				$('<a>').addClass('cl').text(getNameString(content)));
	}
	
	function show_note(id)
	{ 
		$('#for_note1').empty();
		$('#l1').empty();
		$('#edit_button').show();
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
		isNewNote=true;
	    $('#edit_time').empty();
		$('#newNote').val('');
		$('#newText').val('');
		show_edit_page();
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
		$('input').each(function()
		{ 
			id_note=$(this).parents('li').attr('id');
			if($(this).attr('checked')==true)
			{
				deleteRecord(id_note);
			}
		});
	});
	
	function addListeners() 
	{
		$('a.cl').click(function(e)
		{
			show_main_page();
			idn=$(this).parents('li').attr('id');
			show_note(idn);
		});
	
		$('li').click(function(e)
		{
			show_main_page();
			idn=$(this).attr('id');
			show_note(idn);
		});	
	} 
	
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
	
});//$(function()