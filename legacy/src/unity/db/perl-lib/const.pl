$DB = 'wrct';
#$HOME = '/';
$HTML = $ENV{WWW_SITE};  #'/raid/db/htdocs';  Make a symlink or something
$INC = "$HTML/inc/$DB";
$IMG = "/img/$DB";

$METHOD = 'get';
$CUTOFF = 50; # number of chars to truncate long entries
$RECPERPAGE = 10;
$WIDTH = 500; # the width of the content
$VA_ID = 11328; # the ArtistID of "Various Artists"
$RANDOM_ID = 137; # the ProgramID of "Random Schedule"
$NAN_ID = 1; # the ID of the records that don't exist

# Review beat-down: for the "Reviews this semester" information,
# we need a threshold for what date to start counting the reviews for
# "this semester".  MONTH and DAY should be two digit 0-padded strings
# and YEAR should be a four digit string.
$REVIEWS_MONTH = '08';
$REVIEWS_YEAR = '2007';
$REVIEWS_DAY = '27';

@DEFAULTLIST = qw( Artist Album Label Review User Program SubGenre Genre );

1;
