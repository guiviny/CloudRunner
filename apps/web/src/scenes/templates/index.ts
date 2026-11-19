import type { SceneTemplateId } from '../../content/schema'
import type { SceneTemplate } from '../types'
import { awsCli } from './awsCli'
import { catalog } from './catalog'
import { managedDb } from './managedDb'
import { rdsBackup } from './rdsBackup'
import { rdsInstance } from './rdsInstance'
import { rdsMultiAz } from './rdsMultiAz'
import { securityLayers } from './securityLayers'
import { sharedResponsibility } from './sharedResponsibility'
import { vpcNetwork } from './vpcNetwork'

export const templates: Record<SceneTemplateId, SceneTemplate> = {
  'vpc-network': vpcNetwork,
  'security-layers': securityLayers,
  'shared-responsibility': sharedResponsibility,
  'managed-db': managedDb,
  catalog,
  'rds-instance': rdsInstance,
  'rds-backup': rdsBackup,
  'rds-multi-az': rdsMultiAz,
  'aws-cli': awsCli,
}
