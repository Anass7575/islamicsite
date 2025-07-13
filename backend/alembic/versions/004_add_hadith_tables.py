"""Add hadith tables

Revision ID: 004
Revises: 003
Create Date: 2025-01-07 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '004_add_hadith_tables'
down_revision = '3dabf41564a6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create hadith_collections table
    op.create_table('hadith_collections',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('collection_id', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('arabic_name', sa.String(length=200), nullable=False),
        sa.Column('author', sa.String(length=200), nullable=False),
        sa.Column('author_arabic', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('total_hadiths', sa.Integer(), default=0),
        sa.Column('books', sa.Integer(), default=0),
        sa.Column('authenticity', sa.String(length=20), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_hadith_collections_collection_id'), 'hadith_collections', ['collection_id'], unique=True)
    op.create_index(op.f('ix_hadith_collections_id'), 'hadith_collections', ['id'], unique=False)
    
    # Create hadith_books table
    op.create_table('hadith_books',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('collection_id', sa.Integer(), nullable=True),
        sa.Column('book_number', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('arabic_name', sa.String(length=200), nullable=True),
        sa.Column('hadith_count', sa.Integer(), default=0),
        sa.ForeignKeyConstraint(['collection_id'], ['hadith_collections.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_hadith_books_id'), 'hadith_books', ['id'], unique=False)
    op.create_index('ix_hadith_book_collection_number', 'hadith_books', ['collection_id', 'book_number'], unique=True)
    
    # Create hadith_categories table
    op.create_table('hadith_categories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('category_id', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('arabic_name', sa.String(length=100), nullable=False),
        sa.Column('icon', sa.String(length=10), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('parent_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['parent_id'], ['hadith_categories.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_hadith_categories_category_id'), 'hadith_categories', ['category_id'], unique=True)
    op.create_index(op.f('ix_hadith_categories_id'), 'hadith_categories', ['id'], unique=False)
    
    # Create hadiths table
    op.create_table('hadiths',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('collection_id', sa.Integer(), nullable=False),
        sa.Column('book_id', sa.Integer(), nullable=False),
        sa.Column('hadith_number', sa.Integer(), nullable=False),
        sa.Column('arabic_text', sa.Text(), nullable=False),
        sa.Column('english_text', sa.Text(), nullable=True),
        sa.Column('french_text', sa.Text(), nullable=True),
        sa.Column('narrator_chain', sa.Text(), nullable=True),
        sa.Column('arabic_narrator_chain', sa.Text(), nullable=True),
        sa.Column('grade', sa.String(length=20), nullable=True),
        sa.Column('grade_text', sa.String(length=100), nullable=True),
        sa.Column('reference', sa.String(length=200), nullable=True),
        sa.Column('categories', sa.JSON(), default=list),
        sa.Column('search_vector', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['book_id'], ['hadith_books.id'], ),
        sa.ForeignKeyConstraint(['collection_id'], ['hadith_collections.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_hadiths_id'), 'hadiths', ['id'], unique=False)
    op.create_index('ix_hadith_collection_number', 'hadiths', ['collection_id', 'hadith_number'], unique=False)
    op.create_index('ix_hadith_book_number', 'hadiths', ['book_id', 'hadith_number'], unique=False)
    op.create_index('ix_hadith_grade', 'hadiths', ['grade'], unique=False)
    
    # Create hadith_notes table
    op.create_table('hadith_notes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('hadith_id', sa.Integer(), nullable=False),
        sa.Column('note_text', sa.Text(), nullable=False),
        sa.Column('is_private', sa.Boolean(), default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['hadith_id'], ['hadiths.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_hadith_notes_id'), 'hadith_notes', ['id'], unique=False)
    op.create_index('ix_hadith_note_user_hadith', 'hadith_notes', ['user_id', 'hadith_id'], unique=True)
    
    # Insert initial hadith collections data
    op.execute("""
        INSERT INTO hadith_collections (collection_id, name, arabic_name, author, author_arabic, description, total_hadiths, books, authenticity)
        VALUES 
        ('bukhari', 'Sahih al-Bukhari', 'صحيح البخاري', 'Imam Muhammad al-Bukhari', 'الإمام محمد البخاري', 'The most authentic collection of hadith, compiled over 16 years', 7563, 97, 'sahih'),
        ('muslim', 'Sahih Muslim', 'صحيح مسلم', 'Imam Muslim ibn al-Hajjaj', 'الإمام مسلم بن الحجاج', 'The second most authentic hadith collection after Bukhari', 7453, 56, 'sahih'),
        ('abudawud', 'Sunan Abu Dawud', 'سنن أبي داود', 'Imam Abu Dawud', 'الإمام أبو داود', 'Focus on legal hadiths and practical Islamic jurisprudence', 5274, 43, 'mixed'),
        ('tirmidhi', 'Jami'' at-Tirmidhi', 'جامع الترمذي', 'Imam at-Tirmidhi', 'الإمام الترمذي', 'Known for including the opinions of jurists on each hadith', 3956, 49, 'mixed'),
        ('nasai', 'Sunan an-Nasa''i', 'سنن النسائي', 'Imam an-Nasa''i', 'الإمام النسائي', 'Known for its particular focus on the science of hadith criticism', 5758, 51, 'mixed'),
        ('ibnmajah', 'Sunan Ibn Majah', 'سنن ابن ماجه', 'Imam Ibn Majah', 'الإمام ابن ماجه', 'The sixth canonical hadith collection, includes unique narrations', 4341, 37, 'mixed')
    """)
    
    # Insert initial hadith categories
    op.execute("""
        INSERT INTO hadith_categories (category_id, name, arabic_name, icon, description)
        VALUES 
        ('faith', 'Faith (Iman)', 'الإيمان', '🌟', 'Hadiths about belief, faith, and the pillars of Islam'),
        ('prayer', 'Prayer (Salah)', 'الصلاة', '🕌', 'Hadiths about prayer, its importance, and how to perform it'),
        ('fasting', 'Fasting (Sawm)', 'الصيام', '🌙', 'Hadiths about fasting, Ramadan, and voluntary fasts'),
        ('zakat', 'Charity (Zakat)', 'الزكاة', '💝', 'Hadiths about charity, zakat, and helping others'),
        ('hajj', 'Pilgrimage (Hajj)', 'الحج', '🕋', 'Hadiths about Hajj, Umrah, and visiting the holy sites'),
        ('ethics', 'Ethics & Character', 'الأخلاق والآداب', '🌸', 'Hadiths about good character, manners, and ethical behavior'),
        ('family', 'Family & Marriage', 'الأسرة والنكاح', '👨‍👩‍👧‍👦', 'Hadiths about family life, marriage, and relationships'),
        ('business', 'Business & Trade', 'البيوع والمعاملات', '💼', 'Hadiths about commerce, trade, and financial ethics'),
        ('knowledge', 'Knowledge & Learning', 'العلم', '📚', 'Hadiths about seeking knowledge and education'),
        ('dua', 'Supplications (Du''a)', 'الأدعية والأذكار', '🤲', 'Hadiths containing prayers and remembrances')
    """)


def downgrade() -> None:
    op.drop_index('ix_hadith_note_user_hadith', table_name='hadith_notes')
    op.drop_index(op.f('ix_hadith_notes_id'), table_name='hadith_notes')
    op.drop_table('hadith_notes')
    op.drop_index('ix_hadith_grade', table_name='hadiths')
    op.drop_index('ix_hadith_book_number', table_name='hadiths')
    op.drop_index('ix_hadith_collection_number', table_name='hadiths')
    op.drop_index(op.f('ix_hadiths_id'), table_name='hadiths')
    op.drop_table('hadiths')
    op.drop_index(op.f('ix_hadith_categories_id'), table_name='hadith_categories')
    op.drop_index(op.f('ix_hadith_categories_category_id'), table_name='hadith_categories')
    op.drop_table('hadith_categories')
    op.drop_index('ix_hadith_book_collection_number', table_name='hadith_books')
    op.drop_index(op.f('ix_hadith_books_id'), table_name='hadith_books')
    op.drop_table('hadith_books')
    op.drop_index(op.f('ix_hadith_collections_id'), table_name='hadith_collections')
    op.drop_index(op.f('ix_hadith_collections_collection_id'), table_name='hadith_collections')
    op.drop_table('hadith_collections')