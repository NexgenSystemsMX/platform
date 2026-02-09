//
// Copyright © 2024 Hardcore Engineering Inc.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
//

const fs = require('fs')
const path = require('path')
const exec = require('child_process').exec

exec('git describe --tags --abbrev=0', (err, stdout, stderr) => {
  if (err !== null) {
    try {
      const versionFilePath = path.resolve(__dirname, 'version.txt')
      const version = fs.readFileSync(versionFilePath, 'utf8').trim()
      console.log(version)
    } catch (e) {
      console.log('"0.6.0"')
    }
    return
  }
  const rawVersion = stdout.trim().replace('v', '').replace('s', '').split('.')
  if (rawVersion.length === 3) {
    const version = {
      major: parseInt(rawVersion[0], 10),
      minor: parseInt(rawVersion[1], 10),
      patch: parseInt(rawVersion[2], 10)
    }
    console.log(`"${version.major}.${version.minor}.${version.patch}"`)
  } else {
    try {
      const versionFilePath = path.resolve(__dirname, 'version.txt')
      const version = fs.readFileSync(versionFilePath, 'utf8').trim()
      console.log(version)
    } catch (e) {
      console.log('"0.6.0"')
    }
  }
})
