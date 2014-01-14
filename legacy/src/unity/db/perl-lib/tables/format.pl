sub TblInit {

  my $tblDescription =
{
 name   => 'Format',
 table  => 'Formats',
 fields => { Format  => { longname=>'Physical Format of Album' },
	   },
 ID     => 1,
 display=> 'Format',
 sortby => 'FormatID',
 order  => [ qw( Format ) ],
 dependents => [ 'Album' ],
};
  return $tblDescription;
}

1;
