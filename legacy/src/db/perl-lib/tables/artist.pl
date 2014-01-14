sub TblInit {

  my $tblDescription =
{
 name   => 'Artist',
 table  => 'Artists',
 authlevel => 'User',
 fields => { Artist    => { longname=>'Artist Name' },
	     Comment   => { longname=>'Comment', type=>'text' },
	     ShortName => { longname=>'Alpha Index (no "The" or "A", no spaces, no punctuation)', hide=>1 },
	   },
 ID     => 1,
 alpha  => 'ShortName',
 sortby => 'ShortName,Artist',
 order  => [ qw( Artist ShortName Comment ) ],
 edit   => [ { img=>'cd',
	       url=>'display.cgi?tbl=Album&amp;ArtistID=*fields.ArtistID',
	       caption=>"Display this Artist's Albums",
	     },
	     { img=>'cdwrite',
	       url=>'album.cgi?ArtistID=*fields.ArtistID',
	       caption=>"Add an Album for this Artist",
	     },
	   ],
 lists  => {
     Album=>	{ prep=>'by' },
 },
 search => [ 'ShortName', 'Artist' ],
 dependents => [ 'Album', 'Play' ],
};
  return $tblDescription;
}

1;
