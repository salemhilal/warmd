sub TblInit {

  my $tblDescription =
{
 name   => 'AlbumGenre',
 table  => 'AlbumGenres',
 fields => { AlbumID     => { longname=>'Album', type=>'search' },
	     SubGenreID  => { longname=>'SubGenre ID', type=>'choose' },
	   },
 ID     => 1,
 sortby => 'AlbumID',
 order  => [ qw( AlbumID SubGenreID ) ],
};
  return $tblDescription;
}

1;
