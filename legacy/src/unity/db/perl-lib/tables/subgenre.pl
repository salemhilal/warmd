sub TblInit {

  my $tblDescription =
{
 name   => 'SubGenre',
 table  => 'SubGenres',
 fields => { SubGenre  => { longname=>'SubGenre Name' },
	     GenreID   => { longname=>'Genre ID',
			        type=>'choose',
			     display=>'Genre' },
	   },
 ID     => 1,
 sortby => 'SubGenre',
 order  => [ qw( SubGenre GenreID ) ],
 search	=> ['SubGenre'],
 lists	=> {
     AlbumGenre	=> { prep=>'in' },
     ProgramGenre	=> { prep=>'in' },
 },
 dependents => [ 'AlbumGenre', 'ProgramGenre' ],
};
  return $tblDescription;
}

1;
