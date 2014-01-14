sub TblInit {

  my $artist = 
{
 name   => 'Label',
 table  => 'Labels',
 authlevel => 'User',
 fields => { Label     => { longname=>'Label Name' },
	     ContactPerson => { longname=>'Contact Person' },
	     Email     => { longname=>'Email Address' },
	     Address   => { longname=>'Street Address' },
	     City      => { longname=>'City' },
	     State     => { longname=>'State Code', max=>2 },
	     Zip       => { longname=>'Zip Code', max=>10 },
	     Country   => { longname=>'Country' },
	     Fax       => { longname=>'Fax Number', type=>'tel' },
	     Phone     => { longname=>'Phone Number', type=>'tel' },
	     Comment   => { longname=>'Comment', type=>'text' },
	   },
 ID     => 1,
 alpha  => 'Label',
 sortby => 'Label',
 order  => [ qw( Label ContactPerson Email Address City State
		 Zip Country Fax Phone Comment ) ],
 edit   => [ { img=>'cd',
	       url=>'display.cgi?tbl=Album&amp;LabelID=*fields.LabelID&amp;sortby=ArtistID',
	       caption=>"Display this Label's Albums",
	     },
	     { img=>'cdwrite',
	       url=>'entry.cgi?tbl=Album&amp;LabelID=*fields.LabelID',
	       caption=>"Add an Album for this Label",
	     },
	   ],
 lists  => {
     Album	=> { prep=>'on' },
 },
 search	=> [ 'Label', 'ContactPerson' ],
 dependents => [ 'Album' ],
};
  return $artist;
}

1;
