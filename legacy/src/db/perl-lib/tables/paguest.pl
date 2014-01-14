require 'sql.pl';
require 'form.pl';

sub TblInit {

  my $tblDescription =
{
 name   => 'PAGuest',
 table  => 'PAGuests',
 fields => {  Name      => { longname=>'Name' },
	      Email     => { longname=>'Email Address' },
	      WebSite   => { longname=>'Web Site' },
	      Address   => { longname=>'Street Address' },
	      City      => { longname=>'City' },
	      State     => { longname=>'State Code', max=>2 },
	      Zip       => { longname=>'Zip Code', max=>10 },
	      Country   => { longname=>'Country' },
	      Fax       => { longname=>'Fax Number', type=>'tel' },
	      Phone     => { longname=>'Phone Number', type=>'tel' },
	      Bio       => { longname=>'Bio',type=>'text' },
	      Notes     => { longname=>'Notes',type=>'text' },
	      Photo     => { longname=>'Photo' },
	      Affiliation => { longname=>'Affiliation' },
	      Type      => { longname=>'Type Of Guest',
			     type=>'enum',
			     values=>['person','band','group' ],
			     hide=>1 }, 
	      ArtistID  => { longname=>'ArtistID If It Is A Band', }
	  },
 ID     => 1,
 sortby => 'Name',
 order  => [ qw( Name ) ],
 shortorder => [ qw( Name ) ],
 edit   => [ ],
 lists => { },
 search	=> [ ],
 dependents => [ ],
};
  return $tblDescription;
}

1;
