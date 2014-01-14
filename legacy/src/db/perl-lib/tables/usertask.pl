sub TblInit {

  my $tblDescription =
{
 name   => 'UserTask',
 table  => 'UserTasks',
 fields => { UserID	=> { longname=>'UserName', type=>'search' },
	     Task	=> { longname=>'Task assigned to this User',
			         type=>'enum',
			       values=>['bin', 'psa', 'user', 'program', 'democracynow' ] },
	   },
 ID     => 0,
 sortby => 'UserID',
 order  => [ qw( UserID Task ) ],
};
  return $tblDescription;
}

1;
