require 'const.pl';
require 'error.pl';
require 'form.pl';
require 'login.pl';
require 'task.pl';

$images =
{
 cd	=> { f=>'cd.gif', w=>19, h=>17, alt=>'View Albums' },
 cdwrite=> { f=>'cdwrite.gif', w=>19, h=>17, alt=>'Add an Album' },
 file	=> { f=>'file.gif', w=>16, h=>16, alt=>'View Reviews' },
 filewrite => { f=>'filewrite.gif', w=>16, h=>16, alt=>'Add a Review' },
 folder	=> { f=>'folder.gif', w=>18, h=>16, alt=>'View SubGenres' },
 folderwrite => { f=>'folderwrite.gif', w=>18, h=>16, alt=>'Add a SubGenre' },
 arrows	=> { f=>'arrows.gif', w=>21, h=>16, alt=>'Merge this record into another' },
 trash	=> { f=>'trash.gif', w=>16, h=>16, alt=>'Delete this record' },
 pencil	=> { f=>'pencil.gif', w=>16, h=>16, alt=>'Edit this record' },
 R_Yes	=> { f=>'R-Yes.gif', w=>18, h=>19, alt=>'Track is a request' },
 R_No	=> { f=>'R-No.gif', w=>18, h=>19, alt=>'Track is not a request' },
 B_Yes	=> { f=>'B-Yes.gif', w=>18, h=>19, alt=>'Track is a bin cut' },
 B_No	=> { f=>'B-No.gif', w=>18, h=>19, alt=>'Track is not a bin cut' },
 Mark_Yes => { f=>'Mark-Yes.gif', w=>18, h=>19, alt=>'Track is marked' },
 Mark_No=> { f=>'Mark-No.gif', w=>18, h=>19, alt=>'Track is not marked' },
 OOB_Single=> { f=>'OOB-Single.gif', w=>18, h=>19, alt=>'OOB this album' },
};
sub img {
  my ($name) = @_;
  my $img = $$images{$name};

  return "<img src=\"$IMG/$$img{f}\" width=\"$$img{w}\" height=\"$$img{h}\" alt=\"$$img{alt}\" title=\"$$img{alt}\" border=\"0\" />";
}

sub printHead {
  my ($tbl, $cgi, $user, $nosearch) = @_;
  my $params = $cgi->Vars;

  print $cgi->header;

  ($tbl and open(HEAD, "$INC/".$tbl->{name}."Head.html")) or
   open(HEAD, "$INC/Head.html") or
     &error("couldn't open header file '$INC/".$tbl->{name}."Head.html'");
  print while $_ = <HEAD>;
  close HEAD;

  if (&AuthGTE($$user{AuthLevel}, 'User')) {
    print '
<table width="100%" border="0">
  <tr>
    <td align="left">
<a href="index.cgi?session=',&encrypt($$user{UserID}),'" target="_top">Home</a> |
<a href="/logout/" target="_top">Log Out</a> |
<a href="schedule.cgi?session=',&encrypt($$user{UserID}), '" target="_top">Schedule</a> |
<a href="help.cgi?session=',&encrypt($$user{UserID}), '&amp;pg=', $$tbl{name}, '" target="_top">Help</a>
    </td>
';
#    &printShortTasks($cgi, $user);

    unless ($nosearch) {
      print '    <td align="right">', "\n";
      &printSearchForm(undef,$cgi,{debug=>$$params{debug},session=>$$params{session}});
      print "    </td>\n";
    }
    print "  </tr>\n</table>\n";
  }
}

sub printFoot {
  my ($tbl, $cgi, $user) = @_;

  ($tbl and open(FOOT, "$INC/".$tbl->{name}."Foot.html")) or
   open(FOOT, "$INC/Foot.html") or
     &error("couldn't open footer file '$INC/".$tbl->{name}."Foot.html'");
  print while $_ = <FOOT>;
  close FOOT;
}

sub printStartData {
  print <<DONE;

<table border="0" bgcolor="#333333" width="400"><tr><td align="center">

DONE
}
sub printEndData {
  print <<DONE;

</td></tr></table><br />

DONE
}

sub printEditingLinks {
  my ($tbl, $cgi, $user, $fields, $opt) = @_;
  my $session = $cgi->param('session');
  print "printEditingLinks: edit = $$opt{edit} long = $$opt{long}<br />\n" if $cgi->param('debug');
  $$opt{nodefaults} = 1 if $$tbl{nodefaults};

  print "Skipping defaults<br />\n" if $$opt{debug} and $$opt{nodefaults};

  if ($$opt{long}) { # "long" display mode

    print ('<h2>Editing Links</h2>
<a href="entry.cgi?session=',$session,'&amp;tbl=',$$tbl{name},'&amp;id=',
	   $$fields{"$$tbl{name}ID"},'" accesskey="6"><img src="',
	   $IMG,'/pencil.gif" width="16" height="16" border="0" alt="Edit" />
Edit this ',$$tbl{name},'</a><br />
<a href="delete.cgi?session=',$session,'&amp;tbl=',$$tbl{name},'&amp;',$$tbl{name},'ID=',
	   $$fields{"$$tbl{name}ID"},'"><img src="',
	   $IMG,'/trash.gif" width="16" height="16" border="0" alt="Delete" />
Delete this ',$$tbl{name},'</a><br />
<a href="merge.cgi?session=',$session,'&amp;tbl=',$$tbl{name},'&amp;idfrom=',
	   $$fields{"$$tbl{name}ID"},'"><img src="',
	   $IMG,'/arrows.gif" width="21" height="16" border="0" alt="Merge" />
Merge this ',$$tbl{name},' into another ', $$tbl{name}, "</a><br />\n")
      if $$opt{edit} and not $$opt{nodefaults};

    foreach my $link (@{$tbl->{edit}}) {
      next unless $$user{AuthLevel} and &AuthGTE($$user{AuthLevel}, $$link{auth} || 'User', $cgi->param('debug'));
      # preprocess link:
      # *fields.foo gets replaced by $$fields{foo}
      my $url = $$link{url};
      $url =~ s/\*fields\.(\w+)/$$fields{$1}/g;
      $url .= "&amp;session=$session" if $url;
      my $img = $$link{img};
      $img =~ s/\*fields\.(\w+)/$$fields{$1}/g;
      # DEBUG
#      print "$1 = $$fields{$1}" if $cgi->param('debug');
      print ('<a href="',$url,'"', ($$link{target} ? ' target="'.$$link{target}.'"' : ''), 
	   ($$link{accesskey} ? ' accesskey="'.$$link{accesskey}.'"' : ''), '>',
	     &img($img)," $$link{caption}</a><br />\n");
    }

  } else { # default display mode (compact)
    print "    <td nowrap=\"nowrap\">\n";
    print "Edit\n" if $cgi->param('debug') and $$opt{edit};
    print ('      <a href="entry.cgi?session=',$session,'&amp;tbl=',$$tbl{name},'&amp;id=',
	   $$fields{"$$tbl{name}ID"},'"><img src="',
	   $IMG,'/pencil.gif" width="16" height="16" border="0" alt="Edit" /></a>
      <a href="delete.cgi?session=',$session,'&amp;tbl=',$$tbl{name},'&amp;',$$tbl{name},'ID=',
	   $$fields{"$$tbl{name}ID"},'"><img src="',
	   $IMG,'/trash.gif" width="16" height="16" border="0" alt="Delete" /></a>',"\n")
	if $$opt{edit} and not $$opt{nodefaults};

    foreach my $link (@{$tbl->{edit}}) {
      next unless $$user{AuthLevel} and &AuthGTE($$user{AuthLevel}, $$link{auth} || 'User', $cgi->param('debug'));

      # preprocess link:
      # *fields.foo gets replaced by $$fields{foo}
      my $url = $$link{url};
      $url =~ s/\*fields\.(\w+)/$$fields{$1}/g;
      $url =~ s/\?/\?session=$session&amp;/g if $url;
      my $img = $$link{img};
      $img =~ s/\*fields\.(\w+)/$$fields{$1}/g;
      # DEBUG
#      print "$1 = $$fields{$1}" if $cgi->param('debug');
      print ('      ', ($url ? '<a href="'.$url.'"'.($$link{target} ? ' target="'.$$link{target}.'"' : '').'>' : ''),
	     &img($img), ($url ? '</a>' : ''), "\n");
    }
    
    print ('<a href="bin.cgi?session=',$session,'&amp;debug=',$cgi->param('debug'),'&amp;action=OOBSingle&amp;sec=Bin&amp;AlbumID=',$$fields{"$$tbl{name}ID"},'">',
    &img('OOB_Single'),'</a>')
    if $$opt{oob} and $$user{AuthLevel} and &AuthGTE($$user{AuthLevel}, $$link{auth} || 'User', $cgi->param('debug'));



    print "    </td>\n";
  }
}

1;
