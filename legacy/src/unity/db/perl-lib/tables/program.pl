require 'sql.pl';
require 'form.pl';

sub TblInit {

  my $tblDescription =
{
 name   => 'Program',
 table  => 'Programs',
 fields => { Program	=> { longname=>'Program Name' },
	     UserID	=> { longname=>"Host's Name", type=>'search', hide=>1 },
	     DJName	=> { longname=>'DJ Name(s)' },
	     StartTime	=> { longname=>'Start Time/Date of Show', type=>'dow_time' },
	     EndTime	=> { longname=>'End Time/Date of Show', type=>'dow_time' },
	     Type	=> { longname=>'Type of Programming',
			         type=>'enum',
			       values=>['show', 'pa'],
			         hide=>1 },
	     Promo	=> { longname=>'Show Promo Text', type=>'text' },
	     PromoCode	=> { longname=>'Show Promo Code', hide=>1 },
	     Website	=> { longname=>'Alternate Website', type=>'url' },
	   },
 ID     => 1,
 sortby => 'StartTime, EndTime',
 order  => [ qw( Program UserID DJName StartTime EndTime Type Promo PromoCode Website ) ],
 shortorder => [ qw( Program UserID StartTime EndTime ) ],
 edit   => [ { img=>'folderwrite',
	       url=>'entry.cgi?tbl=ProgramGenre&amp;ProgramID=*fields.ProgramID',
	       caption=>"Add a Genre to this Program",
	     },
# This is broken
#	     { img=>'file',
#	       url=>'playlist.cgi?id=*fields.ProgramID',
#	       caption=>"Open a new Playlist",
#	     },
	   ],
 lists => {
     ProgramGenre	=> { type=>'short' },
     PlayList		=> { url=>'playlist.cgi?id=*fields.PlayListID' },
 },
 search	=> [ 'Program' ],
 dependents => [ 'PlayList', 'ProgramGenre' ],
};
  return $tblDescription;
}

1;
