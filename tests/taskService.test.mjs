import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFile } from 'node:fs/promises'
const source = await readFile(new URL('../src/services/taskService.js', import.meta.url), 'utf8')
for (const operation of ['createTask','updateTask','deleteTask']) {
  for (const denied of [false,true]) {
    test(`${operation} ${denied ? 'permission failure' : 'success'} is diagnosed`, async () => {
      const logs=[]
      const query = {
        insert: () => query, update: () => query, delete: () => query, eq: () => query, select: () => query,
        single: async () => denied ? { error: { code:'42501',message:'Ownership mismatch' } } : { data:{id:'task'},error:null },
      }
      const context=vm.createContext({ console:{info:(...args)=>logs.push(args),error:(...args)=>logs.push(args)} })
      const dependency=new vm.SyntheticModule(['requireSupabase'],function(){this.setExport('requireSupabase',()=>({from:()=>query}))},{context})
      const module=new vm.SourceTextModule(source,{context})
      await module.link(()=>dependency)
      await module.evaluate()
      const request=module.namespace[operation]('task',{})
      if(denied) {
        await assert.rejects(request, /permission/)
        assert.equal(logs.at(-1)[0],'task_mutation_failed')
        assert.equal(logs.at(-1)[1].reason,'Ownership mismatch')
        assert.equal(logs.at(-1)[1].code,'42501')
      } else {
        await request
        assert.equal(logs.at(-1)[0],'task_mutation_succeeded')
      }
    })
  }
}
