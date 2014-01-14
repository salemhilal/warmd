sub TblInit {

  my $tblDescription =
{
 name   => 'Genre',
 table  => 'Genres',
 fields => { Genre  =>   { longname=>'Genre Name' },
	   },
 ID     => 1,
 display=> 'Genre',
 sortby => 'GenreID',
 order  => [ qw( Genre ) ],
 edit   => [ { img=>'folder',
	       url=>'display.cgi?tbl=SubGenre&amp;GenreID=*fields.GenreID',
	       caption=>"Display SubGenres of this Genre",
	     },
	     { img=>'folderwrite',
	       url=>'entry.cgi?tbl=SubGenre&amp;GenreID=*fields.GenreID',
	       caption=>"Enter a SubGenre of this Genre",
	     },
	   ],
 search	=> ['Genre'],
 lists  => {
     SubGenre	=> {},
     Album	=> { prep=>'in' },
 },
 dependents => [ 'Album', 'SubGenre' ],
};
  return $tblDescription;
}

1;
