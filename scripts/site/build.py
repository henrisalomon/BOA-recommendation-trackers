#!/usr/bin/env python3
"""Package only the public static site. No publication/network operations."""
import argparse, html, json, os, re, shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
def base_path(explicit=None,repository=None):
 if explicit is not None:
  value=explicit
 elif repository:
  owner,repo=repository.split('/',1);value='' if repo.lower()==owner.lower()+'.github.io' else '/'+repo
 else:return './'
 if value in ('','/'):return '/'
 if not re.fullmatch(r'/[A-Za-z0-9_.%/-]+/?',value) or '..' in value:raise ValueError('Invalid repository base path')
 return value.rstrip('/')+'/'
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--base-path',default=None);parser.add_argument('--output',default='dist');a=parser.parse_args()
 base=base_path(a.base_path,os.environ.get('GITHUB_REPOSITORY'))
 out=(ROOT/a.output).resolve()
 if out==ROOT or ROOT not in out.parents or out.name in ('website','data','reports','scripts','tests'):raise ValueError('Unsafe output directory')
 # No clearing of unrelated files. Copy a deterministic public allowlist.
 out.mkdir(parents=True,exist_ok=True)
 for name in ['assets','data','reports']:
  shutil.copytree(ROOT/'website'/name,out/name,dirs_exist_ok=True)
 for name in ['index.html','methodology.html','DATA_GAPS.md']:
  shutil.copyfile(ROOT/'website'/name,out/name)
 for page in ['index.html','methodology.html']:
  index=(out/page).read_text().replace('<base href="./">','<base href="'+html.escape(base,quote=True)+'">')
  (out/page).write_text(index)
 (out/'.nojekyll').touch()
 (out/'build-info.json').write_text(json.dumps({'basePath':base,'source':'website','publication':'Not performed by build script'},indent=2)+'\n')
 print(f'Built {out} with base path {base}; no publication performed.')
if __name__=='__main__':main()
