sub TblInit {

  my $tblDescription =
{
 name   => 'User',
 table  => 'Users',
 fields => { User	=> { longname=>'Login Name' },
	     WRCTUser   => { longname=>'Kerberos Login' },
	     FName	=> { longname=>'First Name' },
	     LName	=> { longname=>'Last Name' },
	     DJName	=> { longname=>'DJ Name' },
	     Password	=> { longname=>'Password', type=>'passwd' },
	     AuthLevel	=> { longname=>'Authentication Level', type=>'enum',
			     values=>['None','Trainee','User','Exec','Admin'] },
	     Email	=> { longname=>'E-mail address' },
	     Phone	=> { longname=>'Home Phone', type=>'tel' },
	     DateTrained => { longname=>'Date Trained', type=>'date' },
	   },
 ID     => 1,
 sortby => 'LName, FName',
 searchfield => "concat(LName, ', ', FName) AS User",
 order  => [ qw( WRCTUser User FName LName DJName Email Phone Password AuthLevel DateTrained ) ],
 search	=> [ 'User', 'WRCTUser', 'FName', 'LName', 'DJName' ],
 edit	=> [ { img=>'file',
	       url=>'entry.cgi?tbl=Program&amp;UserID=*fields.UserID',
	       caption=>"Add a New Program for this User",
	     },
	     { img=>'folder',
	       url=>'entry.cgi?tbl=UserTask&amp;UserID=*fields.UserID',
	       caption=>"Add a New Task for this User",
	     },
	   ],
 lists	=> {
     Program	=> {},
     UserTask	=> { type=>'short' },
     Review	=> { prep=>'by' },
 },
 dependents => [ 'Playlist', 'Program', 'Review', 'UserTask' ],
};
  return $tblDescription;
}

1;
