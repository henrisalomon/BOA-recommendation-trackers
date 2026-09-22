import sys,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
from entities import EntityResolver,audit_period

class EntityTests(unittest.TestCase):
    def setUp(self):self.r=EntityResolver(ROOT)
    def test_pko_periods(self):
        self.assertEqual(audit_period(2020,'II'),'2019-20')
        self.assertEqual(audit_period(2023,'II'),'2022-23')
        self.assertEqual(audit_period(2023,'I'),'2023')
    def test_internal_conjunctions(self):
        x=self.r.resolve('Department of Management Strategy, Policy and Compliance and Department of Operational Support')
        self.assertEqual(x['entities'],['DMSPC','DOS']);self.assertEqual(x['responsibility_type'],'Joint')
        self.assertEqual(self.r.resolve('Department of Economic and Social Affairs')['responsibility_type'],'Individual')
    def test_offices_count_and_repetition_does_not(self):
        x=self.r.resolve('DMSPC BTAD and DMSPC OPPFB')
        self.assertEqual(len(x['offices']),2);self.assertEqual(x['responsibility_type'],'Joint')
        self.assertEqual(self.r.resolve('BTAD and BTAD')['responsibility_type'],'Individual')
        self.assertEqual(self.r.resolve('DMSPC')['offices'],[{'entity':'DMSPC','office':None}])
    def test_dco_merger(self):
        x=self.r.resolve('DCO and UNDCO and Development Coordination Office')
        self.assertEqual(x['entities'],['DCO']);self.assertEqual(x['responsibility_type'],'Individual')
    def test_historical_separate_and_flagged(self):
        x=self.r.resolve('Department of Management and Department of Field Support')
        self.assertEqual(x['entities'],['DFS','DM']);self.assertEqual(x['entity_mapping_status'],'review_required')
    def test_unknown_never_silently_individual(self):
        self.assertEqual(self.r.resolve('DOS and Unknown Office')['responsibility_type'],'Unknown')
        self.assertEqual(self.r.resolve(None)['entity_mapping_status'],'not_reported')
        x=self.r.resolve('all peacekeeping missions')
        self.assertEqual(x['responsibility_type'],'Joint');self.assertEqual(x['entities'],[])
    def test_eosg_reference_and_verified_aliases(self):
        x=self.r.resolve('Office of Legal Affairs and United Nations Ethics Office')
        self.assertEqual(x['entities'],['Ethics Office','OLA'])
        self.assertEqual(x['entity_mapping_status'],'matched')
        self.assertEqual(self.r.resolve('UNMSIL')['entities'],['UNSMIL'])
        self.assertEqual(self.r.resolve('UNMSIL and UNSMIL')['responsibility_type'],'Individual')
        self.assertEqual(self.r.resolve('RCS and DCO')['entities'],['DCO','RCS'])
        self.assertEqual(self.r.resolve('RCS and DCO')['responsibility_type'],'Joint')

if __name__=='__main__':unittest.main()
