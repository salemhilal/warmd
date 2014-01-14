sub TblInit {

  my $tblDescription = 
{
 name   => 'Event',
 table  => 'Events',
 fields => { Event => { longname=>'Name of Event' },
             VenueID => { longname=>'Venue', type=>'search' },
             Type => { longname=>'Venue Type', type=>'enum',
                 values=>['Concert','Cultural']},
             ExpirDate => { longname=>'Expiration Date', type=>'date'},
	   },
 ID     => 1,
 sortby => 'ExpirDate',
 order  => [ qw( Event VenueID Type ExpirDate ) ],
 search	=> [ 'Event', 'Type' ],
};
  return $tblDescription;
}

1;
