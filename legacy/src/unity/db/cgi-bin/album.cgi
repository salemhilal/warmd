#!/usr/bin/perl

# An entry form tailored to Albums.

use lib "$ENV{WWW_SITE}/perl-lib";
use lib "$ENV{WWW_SITE}/perl-lib/tables";
require "sql.pl";
require "interface.pl";
require "record.pl";
require "form.pl";
require 'login.pl';
require 'search.pl';

use CGI;

my($cgi) = new CGI;
my $params = $cgi->Vars;

our $tbls;
# Retrieve table definitions.
require 'album.pl';
$$tbls{album} = &TblInit;
my $album = $$tbls{album};
require 'review.pl';
$$tbls{review} = &TblInit;
my $review = $$tbls{review};
require 'albumgenre.pl';
$$tbls{genre} = &TblInit;
my $genre = $$tbls{genre};
require 'subgenre.pl';
$$tbls{subgenre} = &TblInit;
my $genrelist = $$tbls{subgenre};

$user = &loginSession($$params{session}, undef, $tbls);
&printHead($album, $cgi, $user);

# Set the AlbumID so that flags don't get raised in the Reviews table
$$params{AlbumID} = $$params{id} if $$params{id};


########################################################################
# If we're trying to edit/add an album, we need to verify input
# and possibly ask for clarification from the user.
########################################################################
if ($$params{submit} eq 'record') {

  my @search;

  ########################################
  # Check validity of album params
  print "Calling verifyInput({$$album{name}}, \$cgi, 'AlbumID')<br />\n" if $$params{debug};
  my $alert = verifyInput($album, $cgi, 'AlbumID');
  if ($$alert{search}) {
    # User entered one or more search fields, so we need to
    # lookup each one and ask user to make a choice/try again.

    unless (@search) { # Only print the form tag once
      print '<form action="album.cgi" method="', $METHOD, "\">\n";
      print '<input type="hidden" name="escape" value="1" \>', "\n";
    }
    foreach my $field (@{$$album{order}}) {
      if ($$alert{fields}->{$field}) {
	&printSearchResults($album, $cgi, $user, $field, undef, $albums);
      } else {
	print '<input type="hidden" name="', $field, '" value="',
	  ($$params{escape} ? $$params{$field} : $cgi->escape($$params{$field})),
	    "\" />\n";
      }
    }
    push @search, 'album';
  }

  ########################################
  # Check validity of review params (if present
  if ($$params{Review}) {
    print "Calling verifyInput({$$review{name}}, \$cgi, 'AlbumID')<br />\n" if $$params{debug};
    my $alert = verifyInput($review, $cgi, 'AlbumID');
    if ($$alert{search}) {
      # User entered one or more search fields, so we need to
      # lookup each one and ask user to make a choice/try again.

      unless (@search) { # Only print the form tag once
	print '<form action="album.cgi" method="', $METHOD, "\">\n";
	print '<input type="hidden" name="escape" value="1" />', "\n";

	# Also, we need to save state for the album if it hasn't been done with
	# a printSearchResults call already.
	print '<input type="hidden" name="', $_, '" value="', $$params{$_}, "\" />\n"
	  foreach (@{$$album{order}});
      }
      foreach my $field (@{$$review{order}}) {
	if ($$alert{fields}->{$field}) {
	  &printSearchResults($review, $cgi, $user, $field, undef, $reviews);
	} else {
	  print '<input type="hidden" name="', $field, '" value="',
	    ($$params{escape} ? $$params{$field} : $cgi->escape($$params{$field})),
	      "\" />\n";
	}
      }
      push @search, 'review';
    }
  }

  ########################################
  # If there are unverified search params, save state and exit
  if (@search) {

    print '<input type="hidden" name="SubGenreID" value="', $_, "\" />\n"
      foreach ($cgi->param('SubGenreID'));

    print <<DONE;
<input type="hidden" name="session" value="$$params{session}" />
<input type="hidden" name="debug" value="$$params{debug}" />
<input type="hidden" name="id" value="$$params{id}" />
<input type="hidden" name="submit" value="record" />
<input type="submit" value="Confirm" />
</form>
DONE
    &printFoot($tbl, $cgi, $user);
    exit(0);
  }

} elsif ($$params{debug}) {
    print "Not verifying input.<br />\n";
}

########################################################################
# Editing an existing album.
########################################################################
my ($oldalbum, $oldreview, $oldgenre, $new);

if ($$params{id}) {

  print "<h1>Edit $$album{name}</h1>\n";
  if ($params->{submit} and not $$alert{null}) { # update the record

    ########################################
    # Update the album fields
    my %albumfields;
    map { $albumfields{$_} = ($$params{escape} ? $cgi->unescape($$params{$_}) : $$params{$_}) } @{$$album{order}};

    &sqlUpdate($album,
	       \%albumfields,
	       { string=>"AlbumID = ?",
		 values=> [ $$params{id} ] },
	       $$params{debug},
	      );
    ########################################
    # Update the review fields
    if ($$params{Review}) {
      my %reviewfields;
      map { $reviewfields{$_} = ($$params{escape} ? $cgi->unescape($$params{$_}) : $$params{$_}) } @{$$review{order}};

      if (RecordExists($review, {string=>'AlbumID = ?', values=>[$$params{id}]}, $$params{debug})) {
	sqlUpdate($review,
		  \%reviewfields,
		  { string=>"AlbumID = ?",
		    values=> [ $$params{id} ] },
		  $$params{debug},
		 );
      } else {
	sqlInsert($review, $$params{debug}, \%reviewfields, $$review{order});
      }
    }
    ########################################
    # Update the genres
    print "Deleting all genres...<br />\n" if $$params{debug};
    &sqlDelete($genre,
	       { string=>'AlbumID = ?',
		 values=> [ $$params{id} ] },
	       $$params{debug});
    for my $subgen ($cgi->param(SubGenreID)) {
      print "Adding genre number $subgen<br />\n" if $$params{debug};
      &sqlInsert($genre, $$params{debug},
		 {AlbumID=>$$params{id}, SubGenreID=>$subgen});
    }

    print "<p>$$album{name} with ID <tt>$$params{id}</tt> updated. (<a href=\"display.cgi?session=$$params{session}&amp;tbl=$$album{name}\&amp;$$album{name}ID=$$params{id}\">View it</a>)\n";
  }
  # then fetch all the fields
  print "looking up old album information<br />\n" if $$params{debug};
  $oldalbum = &sqlSelectRow($album, undef,
			    { string=>"$$album{name}ID = ?",
			      values=> [ $$params{id} ] },
			    undef, $$params{debug});

#  if ($$params{Review}){
    print "looking up old review information<br />\n" if $$params{debug};
    $oldreview = &sqlSelectRow($review, undef,
			       { string=>"$$album{name}ID = ?",
				 values=> [ $$params{id} ] },
			       undef, $$params{debug});
#  }
  print "looking up old review information<br />\n" if $$params{debug};
  ($oldgenre) = &sqlSelectMany($genre, undef,
			       { string=>"$$album{name}ID = ?",
				 values=> [ $$params{id} ] },
			       undef,
			       {debug=>$$params{debug}});
  #print STDERR "Genre: $$_{SubGenre} = $$_{SubGenreID}\n" foreach (@$oldgenre);
  ##print STDERR "done looking up old album information\n";


  # check to see if they're allowed to edit
# Edited out all this crap because it isn't necessary for albums,
# and because it was producing error messages.
#  print "Checking for editing privileges<br />\n" if $$params{debug};
#  if ($$oldalbum{UserID}) {
#      &error("You need an Exec account to edit records")
#	  unless &AuthGTE($$user{AuthLevel}, $$album{authlevel} || 'Exec', $$params{debug})
#	      or ($$oldalbum{UserID} == $$user{UserID});
#  } else {
#      print "Checking sub-tables for editing privileges<br />\n" if $$params{debug};
#      my $edit = 0;
#      foreach $field (keys %$oldalbum) {
#	  if ($field =~ /(\w+)ID/) {
#	      require lc($1).'.pl';
#	      my $sub = &sqlSelectRow(&TblInit, undef,
#				      {string=>"${1}ID = ?", values=>[$$oldalbum{"${1}ID"}]},
#				      $$params{debug});
#	      $edit = 1 if $$sub{UserID} == $$user{UserID};
#	  }
#      }
      &error("You need an Exec account to edit records")
	  unless &AuthGTE($$user{AuthLevel}, $$album{authlevel} || 'Exec', $$params{debug});# or $edit;
#  }


########################################################################
# Entering a new album.
########################################################################
} else {

    print "Checking editing privileges<br />\n" if $$params{debug};
#    my $edit = 0;
    unless (&AuthGTE($$user{AuthLevel}, ($$album{authlevel} or 'Exec'), $$params{debug})) {
#	foreach $field (@{$$tbl{order}}) {
#	    if ($field =~ /(\w+)ID/ and $$params{$field}) {
#		require lc($1).'.pl';
#		my $sub = &sqlSelectRow(&TblInit, undef,
#				  {string=>"$field = ?", values=>[$$params{$field}]},
#				  $$params{debug});
#		$edit = 1 if $$sub{UserID} == $$user{UserID};
#	    }
#	}
	&error("You don't have permission to edit this record.");# unless $edit;
    }

  if ($params->{submit} and not $$alert{null}) { # insert the record

    ########################################
    # Submit Album record
    my %albumfields;
    map { $albumfields{$_} = ($$params{escape} ? $cgi->unescape($$params{$_}) : $$params{$_}) if $$params{$_} ne ''} 
      @{$$album{order}};
    my $id = &sqlInsert($album, $$params{debug}, \%albumfields, $$record{order});

    # check to see if 'search' type fields were filled in
    for(@{$$album{order}}) {
	if ($$album{fields}->{$_}->{type} eq 'search' and not $albumfields{$_}) {
	    print "<p class=\"error\">Error: search fields not submitted properly! Please send the url of this page to ism\@wrct.org for debugging.</p>\n";
	    last; # only need one error message
	}
    }

    ########################################
    # Submit Review Record
    $$params{AlbumID} = $id;
    if ($$params{Review}) {
      my %reviewfields;
      map { $reviewfields{$_} = ($$params{escape} ? $cgi->unescape($$params{$_}) : $$params{$_}) if $$params{$_} ne ''}
	@{$$review{order}};
      sqlInsert($review, $$params{debug}, \%reviewfields, $$review{order});

      # check to see if 'search' type fields were filled in
      for(@{$$review{order}}) {
	if ($$review{fields}->{$_}->{type} eq 'search' and not $reviewfields{$_}) {
	  print "<p class=\"error\">Error: search fields not submitted properly! Please send the url of this page to ism\@wrct.org for debugging.</p>\n";
	  last; # only need one error message
	}
      }
    }

    ########################################
    # Submit subgenres
    for my $subg ($cgi->param(SubGenreID)) {
      sqlInsert($genre, $$params{debug}, {SubGenreID=>$subg, AlbumID=>$id}, $$genre{$order})
    }

    ########################################
    # clear values now that we've submitted them.
    for (keys %albumfields, keys %reviewfields, 'SubGenreID') {
      $cgi->Delete($_) unless $$tbl{fields}->{$_}->{type} eq 'date';
      $cgi->Delete($1) if /(\w+)ID/;
    }

    print "<p>$$album{name} with ID <tt>$id</tt> created. (<a href=\"display.cgi?session=$$params{session}&amp;tbl=$$album{name}\&amp;$$album{name}ID=$id\">View it</a>)\n";
  }

  print "<h1>Enter a new $$album{name}</h1>\n";
}

# check for field params in the query string
for (keys %$params) {
  $new->{$_} = ($$params{escape} ? $cgi->unescape($$params{$_}) : $$params{$_})
    if (defined $$album{fields}->{$_}
	or ($$album{ID} and $_ eq "$$album{name}ID"));
}

########################################################################
# Input form -- this duplicates the functionality of
# form.pl:printInputForm() and adds reviews and subgenres.
########################################################################

#  &printInputSearches($tbl, $cgi, $oldalbum, $new, $$params{debug});

print '<h2>Album Information</h2>

<form action="'.$cgi->url.'" method="get">
<table border="0" cellspacing="10" cellpadding="0">
';

map { &printInputField($cgi, $album->{fields}->{$_}, $_,
		       $$oldalbum{$_}, $$new{$_}, {debug=>$$params{debug}}) }
  @{$album->{order}};


print '</table>
';

########################################
# Now print the fields for a review
print '<h2>Album Review</h2>

<table border="0" cellspacing="10" cellpadding="0">
';
foreach (@{$$review{order}}) {
  printInputField($cgi, $$review{fields}->{$_}, $_,
		  $$oldreview{$_}, $$new{$_}, {debug=>$$params{debug}})
    unless $_ eq 'AlbumID';
}

print "</table>\n";


########################################
# Now subgenre checkboxes
print '<h2>Subgenre Classifications</h2>

<table border="0" cellspacing="10" cellpadding="0">
  <tr valign="top">
    <td>

';
my ($subs, $count) = sqlSelectMany($genrelist, undef, undef, 'SubGenre',
				   {debug=>$$params{debug}, nolookup=>1, count=>1});
my ($col, $n) = (int($count / 3 + 1), 0); # put a column break every $col entries
#print STDERR "album.cgi: column break every $col entries\n";

my (%genres);
$genres{$$_{SubGenreID}} = 1 foreach (@$oldgenre);
#print STDERR 'subgenres: ', join(', ', sort keys %genres), "\n";

for my $sub (@{$subs}) {
  print "    </td>\n    <td>\n" if $n and not $n % $col;
  print '<input type="checkbox" name="SubGenreID" value="',$$sub{SubGenreID},
    ($genres{$$sub{SubGenreID}} ? 'checked="checked' : ''), '" />
', $$sub{SubGenre},' <br />

';

  $n++;
}

print '    </td>
  </tr>
  <tr>
    <td colspan="3" align="right"><input type="submit" value="',
      ($$params{id} ? 'Confirm Changes' : 'Add '.$$album{name}), '" />
      <input type="hidden" name="submit" value="record" />
';
$cgi->Delete('submit'); # this sucker was causing a nasty little bug

# save state -- print out hidden fields for every cgi param
# not already accounted for.
my $params = $cgi->Vars;
foreach my $key (keys %{$params}) {
  print ('      <input type="hidden" name="', $key,
	 '" value="', $cgi->escape($$params{$key}), '" />', "\n")
    unless exists $album->{fields}->{$key};
}

print '
    </td>
  </tr>
</table>
</form>
<br />
';


&printFoot($album, $cgi, $user);
