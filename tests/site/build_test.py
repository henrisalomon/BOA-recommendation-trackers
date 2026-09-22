import importlib.util, pathlib, unittest
spec=importlib.util.spec_from_file_location('build',pathlib.Path(__file__).resolve().parents[2]/'scripts/site/build.py');build=importlib.util.module_from_spec(spec);spec.loader.exec_module(build)
class BasePathTests(unittest.TestCase):
 def test_project_path(self):self.assertEqual(build.base_path(repository='owner/boa-trackers'),'/boa-trackers/')
 def test_user_site(self):self.assertEqual(build.base_path(repository='owner/owner.github.io'),'/')
 def test_pages_custom_domain(self):self.assertEqual(build.base_path('', 'owner/repo'),'/')
 def test_local(self):self.assertEqual(build.base_path(),'./')
 def test_bad_path(self):
  with self.assertRaises(ValueError):build.base_path('/../../oops')
spec2=importlib.util.spec_from_file_location('locators',pathlib.Path(__file__).resolve().parents[2]/'scripts/site/locators.py');loc=importlib.util.module_from_spec(spec2);spec2.loader.exec_module(loc)
class PrintedPageTests(unittest.TestCase):
 def test_symbol_is_not_page(self):self.assertIsNone(loc.printed_page('A/71/5 (Vol. I)'))
 def test_footer_precedes_symbols(self):self.assertEqual(loc.printed_page('16-16791 107/288 \nA/70/5 (Vol. I)\npara. 21'),107)
 def test_reverse_footer(self):self.assertEqual(loc.printed_page(' 4/48  16-19004 \n'),4)
 def test_missing_is_unknown(self):self.assertIsNone(loc.printed_page('Text without a page label'))
if __name__=='__main__':unittest.main()
