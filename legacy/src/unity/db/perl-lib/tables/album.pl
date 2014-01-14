require 'sql.pl';
require 'form.pl';

sub TblInit {

  my $tblDescription =
{
 name   => 'Album',
 table  => 'Albums',
 authlevel => 'User',
 fields => { ArtistID	=> { longname=>'Artist', type=>'search', notnull=>1 },
	     LabelID	=> { longname=>'Label', type=>'search' },
#	     ReleaseNum	=> { longname=>'Release Number (Provided by Label)', max=>20 },
	     GenreID	=> { longname=>'Genre ID', type=>'choose' },
	     FormatID	=> { longname=>'Format ID', type=>'choose' },
	     Album	=> { longname=>'Album Name' },
	     Year	=> { longname=>'Year of Release', max=>4 },
	     Comp	=> { longname=>'Is this a Compilation?',
			         type=>'enum',
			       values=>[ 'No', 'Yes' ], },
	     Status	=> { longname=>'Library Status',
			         type=>'enum',
			       values=>['Library', 'Bin','N&WC','NIB','TBR','OOB','Missing'],
			         hide=>1, accesskey=>5 },
	     HighestChartPosition => { longname=>'Highest Chart Position' },
	     DateAdded	=> { longname=>'Date Added To Bin', type=>'date', hide=>1 },
	     DateRemoved => { longname=>'Date Removed From Bin', type=>'date', hide=>1 },
	   },
 ID     => 1,
 alpha  => 'Album',
 sortby => 'ArtistID,Year',
 order  => [ qw( ArtistID Album Year LabelID GenreID FormatID Comp Status
		 DateAdded DateRemoved ) ],
 shortorder => [ qw( ArtistID Album Year LabelID GenreID FormatID Comp Status DateAdded ) ],

 nodefaults => 1, # We're going to replace the default editing links with the ones below
 edit   => [ { img=>'pencil',
	       url=>'album.cgi?id=*fields.AlbumID',
	       caption=>"Edit this Album",
	       auth=>'User',
	       accesskey=>6,
	     },
	     { img=>'trash',
	       url=>'delete.cgi?tbl=Album&amp;AlbumID=*fields.AlbumID',
	       caption=>"Delete for this Album",
	       auth=>'Exec',
	     },
	     { img=>'arrows',
	       url=>'merge.cgi?tbl=Album&amp;idfrom=*fields.AlbumID',
	       caption=>"Merge this Album into another",
	       auth=>'Exec',
	     },
	     { img=>'filewrite',
	       url=>'entry.cgi?tbl=Review&amp;AlbumID=*fields.AlbumID',
	       caption=>"Add a Review for this Album",
	       auth=>'User',
	     },
	     { img=>'folderwrite',
	       url=>'entry.cgi?tbl=AlbumGenre&amp;AlbumID=*fields.AlbumID',
	       caption=>"Add a SubGenre Classification for this Album",
	       auth=>'User',
	     },
	   ],
 lists  => {
     AlbumGenre	=>{ type=>'short' },
     Review	=>{ auth=>'User' },
 },
 entrylists => {
     Review	=> { caption=>'Enter a new Review for this Album', type=>'full' },
     SubGenre	=> { caption=>'What genres apply to this Album?', type=>'multi' },
 },
 search => [ 'Album', 'Year' ],
 dependents => [ 'AlbumGenre', 'Play', 'Review' ],
};
  return $tblDescription;
}

1;
