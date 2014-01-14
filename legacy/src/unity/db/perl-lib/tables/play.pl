require 'sql.pl';
require 'form.pl';

sub TblInit {

  my $tblDescription =
{
 name   => 'Play',
 table  => 'Plays',
 fields => { Time	=> { longname=>'Time of Play' },
	     PlayListID	=> { longname=>'PlayList ID' },
	     ArtistID	=> { longname=>'Artist ID' },
	     AlbumID	=> { longname=>'Album ID' },
	     AltAlbum	=> { longname=>'Album Played' },
	     TrackName	=> { longname=>'Name of Track Played' },
	     R		=> { longname=>'Is this a request?', type=>'enum',
			       values=>['Yes','No']},
	     B		=> { longname=>'Is this a bin cut?', type=>'enum',
			       values=>['Yes','No'] },
	     Mark	=> { longname=>'Generic mark', type=>'enum',
			       values=>['Yes','No'] },
	   },
 ID     => 0,
 sortby => 'Time',
 order	=> [ qw( Time PlayListID ArtistID AlbumID AltAlbum TrackName R B Mark ) ],
 shortorder => [ qw( ArtistID AlbumID AltAlbum TrackName ) ],
 timestamp => 'Time',
 edit   => [ { img=>'Mark_*fields.Mark',
	       url=>'playlist.cgi?mode=rows&amp;id=*fields.PlayListID&amp;Time=*fields.Time&amp;action=reverse&amp;field=Mark',
	       target=>'_self',
	       caption=>"Change the status of this marker",
	     },
	     { img=>'R_*fields.R',
	       url=>'playlist.cgi?mode=rows&amp;id=*fields.PlayListID&amp;Time=*fields.Time&amp;action=reverse&amp;field=R',
	       target=>'_self',
	       caption=>"Change the status of this marker",
	     },
	     { img=>'B_*fields.B',
	       caption=>"Bin cut indicator",
	     },
	     { img=>'trash',
	       url=>'playlist.cgi?mode=rows&amp;id=*fields.PlayListID&amp;Time=*fields.Time&amp;action=delete',
	       target=>'_self',
	       caption=>"Delete this Play",
	     },
	   ],
};
  return $tblDescription;
}

1;
