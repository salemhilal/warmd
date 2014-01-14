sub TblInit {

  my $tblDescription = 
{
 name   => 'Venue',
 table  => 'Venues',
 fields => { Venue => { longname=>'Venue Name' },
             ContactPerson => { longname=>'Contact Person' },
             Email => { longname=>'Email Address' },
             Address => { longname=>'Street Address' },
             City => { longname=>'City' },
             State => { longname=>'State Code', max=>2 },
             Zip => { longname=>'Zip Code', max=>10 },
             Country => { longname=>'Country' }, 
             Fax => { longname=>'Fax Number', type=>'tel' },
             Phone => { longname=>'Phone Number', type=>'tel' },
             Website => { longname=>'Website', type=>'url' },
	   },
 ID     => 1,
 sortby => 'Venue',
 order  => [ qw( Venue ContactPerson Email Address City State
                 Zip Country Fax Phone Website) ],
 search	=> [ 'Venue', 'ContactPerson' ],
};
  return $tblDescription;
}

1;
