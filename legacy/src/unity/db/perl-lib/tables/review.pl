sub TblInit {

  my $tblDescription =
{
 name   => 'Review',
 table  => 'Reviews',
 authlevel => 'User',
 fields => { Review  => { longname=>'Text of Review', type=>'text' },
	     UserID  => { longname=>'User', type=>'search', hide=>1 },
	     AlbumID  => { longname=>'Album', type=>'search' },
	   },
 ID     => 1,
 sortby => 'Review',
 order  => [ qw( Review UserID AlbumID ) ],
 search	=> [ 'Review' ],
};
  return $tblDescription;
}

1;
