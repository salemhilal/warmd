#!/usr/bin/perl

# Democracy Now! signup script stuff

use CGI qw/:standard/;
use Data::Dumper;

my @Admin = qw/apw2 mmeyer jt3y/;
my $whoami='apw2';
my $isDNadmin = admin_auth($whoami);

my $mo, $year;

my @times = (
	# Sunday
	[],
	# Monday
	['8AM'],
	# Tuesday
	['8AM'], 
	# Wednesday
	['8AM'], 
	# Thursday
	['8AM','9AM'], 
	# Friday
	['8AM','9AM'], 
	# Saturday
	[]
       );
my %volHash = (
	       '8-19-2004' =>
	       {
		'8AM' => 'mtoups',
		'9AM' => 'mtoups'
	       },
	       '8-20-2004' =>
	       {
		'8AM' => 'dmessing',
		'9AM' => 'apw2'
	       }
	      );

my %emailHash = (
		 'apw2' => 'apw2@wrct.org',
		 'mtoups' => 'apw2+test1@andrew.cmu.edu',
		 'dmessing' => 'apw2+test2@andrew.cmu.edu',
		 'mmeyer' => 'apw2+test3@andrew.cmu.edu'
		 );
my @volunteers = keys %emailHash;

sub do_signup {
  
  my ($aaref) = &sqlSelectMany('DemocracyNow', undef, {}, undef, {});
#  my $aaref={bar => 'foo'};
    print "<PRE>wee!\n".Dumper($aaref)."blarf\n</PRE>";
  if (1 <= param('mo') && param('mo') <= 12) {
    $mo = param('mo')
  } else {
    $mo = 9;
  }
  
  if (2004 <= param('yr') && param('yr') <= 2050) {
    $yr = param('yr')
  } else {
    $yr = 2004;
  }
  
  my @results = `cal $mo $yr`;
  shift @results;
  shift @results;
  
  foreach $res (@results) {
    $res =~s/\n//;
  }
  
  print h2("Welcome $whoami". ($isDNadmin ? ' (admin mode)' : ''));
  
  my $yourslots=666;
  
  my $who = param('who');
  if ($who) {
    unless (grep(/^$who$/, @volunteers)) {
      print h1("Error: no such volunteer '$who'");
      print end_html;
      exit;
    }
    unless ($who eq $whoami || admin_auth($whoami)) {
      print h1("Error: only administrators can sign up/resign other users.");
      print end_html;
      exit;
    }
  }
  if (param('do') eq 'signup') {
    my @selected = param('signup');
    if (@selected && $who) {
      op_signup($who, @selected);
    } else {
      print h1("Error: slots must be selected and a user must be specified in order to sign up.");
    }
  } elsif (param('do') eq 'delete') {
    unless (param('slot')) {
      print h1("Error: a slot must be specified for unregistration to occur.");
      print end_html;
      exit;
    }
    op_delete(param('slot'));
  }
  
  print start_form(-method=>'get', -action=>'dn.cgi');
  print hidden('session', param('session'));
  print hidden('op', 'signup');
  print p("You are signed up for $yourslots slots this month.");
  print p("To sign up for additional slots, place checkmarks in the boxes below, and then click this button:".
	  submit(-name=>'do', -value=>'signup')
	 );
  
  
  print hidden('mo', $mo);
  print hidden('yr', $yr);
  my ($nextmo, $nextyr, $prevmo, $prevyr);
  if ($mo == 12) {
    $nextmo=1;
    $nextyr=$yr+1;
    $prevmo=11;
    $prevyr=$yr;
  } elsif ($mo == 1) {
    $prevmo=12;
    $prevyr=$yr-1;
    $nextmo=2;
    $nextyr=$yr;
  } else {
    $prevmo=$mo-1;
    $prevyr=$yr;
    $nextmo=$mo+1;
    $nextyr=$yr;
  }
  
  print table({-border => 1, -cellspacing=>0, -width=>'100%'}, caption("Democracy Now! Signup Sheet for $mo/$yr"),
	      Tr({}, th ([ qq~<A HREF="?session=~.param('session').qq~&op=signup&mo=$prevmo&yr=$prevyr">&lt;&lt; Month</A>~, undef, undef, undef, undef, undef, qq~<A HREF="?session=~.param('session').qq~&op=signup&mo=$nextmo&yr=$nextyr">Month &gt;&gt;</A>~])),
	      Tr({}, 
		 [th ( ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ] ),
		 ]
		),
	      Tr({-valign=>top}, 
		 [
		  (map 
		   { my $i=0;
		     td ( {-valign=>top, -width=>(100/7).'%'}, [ 
								map { dateBlock($i++, $_, $mo, $yr) } getDates($_)
							       ] )
		   } @results)
		 ]
		)
	     );
  
  if (admin_auth($whoami)) {
    print popup_menu(-name=>'who', -value=>\@volunteers);
  } else {
    print hidden(-name=>'who', -value=>$whoami);
}
  
  print end_form;
  
}


sub admin_auth {
  return (grep(/^$_[0]$/, @Admin));
}

sub op_signup {
  my ($who, @slots) = @_;
  foreach $reqslot(@slots) {
    my ($date, $slot) = split(/_/,$reqslot);
    my %slots = %{$volHash{$date}};
    if ($slots{$slot}) {
      print "<P>Error: slot $slot on $date already reserved by ".$slots{$slot}.".</P>";
    } else {
      $slots{$slot} = $who;
      $volHash{$date} = \%slots;
      print "<P>Successfully registered for $slot on $date</P>";
    }
  }
}

sub op_delete {
  my ($reqslot) = @_;
  my ($date, $slot) = split(/_/,$reqslot);
  my %slots = %{$volHash{$date}};
  if ($slots{$slot} && ($slots{$slot} eq $whoami || admin_auth($whoami))) {
    print "<P>Successfully unregistered ".$slots{$slot}." for $slot on $date.</P>";
    delete $slots{$slot};
    $volHash{$date}=\%slots;
  } elsif ($slots{$slot}) {
    print "<P>Permission error on unregistering ".$slots{$slot}." for $slot on $date.</P>";
  } else {
    print "<P>Error: no user is currently registered for $slot on $date.</P>";
  }
}

sub dateBlock {
  my ($i, $day, $mo, $yr) = @_;
  my $result;
  if ($day) { 
    $result .= "<B>$day</B><BR>";
    $result .= table({-border => 1, -cellpadding=>0, -cellspacing=>0}, 
		     Tr({},
			[ map { th($_) . signupBlock($i, $day, $mo, $yr, $_) } @{@times[$i]} ]
		       )
		    );
  }
  return $result;
}

sub signupBlock {
  my ($i, $day, $month, $year, $slot) = @_;
  my $result;
  my %slots = %{$volHash{"$month-$day-$year"}};
  my $actor = $slots{$slot};
  if ($actor eq $whoami) {
    
    $result.=td(deleteLink("$month-$day-${year}_$slot"));
    $result.=td({-bgcolor=>'green', -width=>'100%'}, actorLink($actor));
    
  } elsif ($actor) {
    if (admin_auth($whoami)) {
      $result .= td(deleteLink("$month-$day-${year}_$slot"));
    }
    $result.=td({-bgcolor=>'yellow', -width=>'100%'}, actorLink($actor));

    
  } else {
    $result.=td(checkbox(-name => "signup", -label=>'', -value=>"$month-$day-${year}_$slot"));
    $result.=td({-bgcolor=>'red', -width=>'100%'}, 'none');

  }
  return $result;
}

sub deleteLink { qq~<A HREF="?session=~.param('session').qq~&op=signup&do=delete&mo=$mo&yr=$yr&slot=$_[0]"><IMG SRC="http://db.wrct.org/img/wrct/trash.gif" BORDER=0></A>~ }

sub actorLink { qq~<A HREF="#">$_[0]</A>~ }

sub getDates {
  my ($line) = @_;
  my @result;
  while ($line) {
    $line =~ s/^(..).?//;
    my $match = $1;
    $match=~s/^\s*//;
    $match=~s/\s*$//;
    push @result, $match;
  }
  return @result;
}
