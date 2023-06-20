import { Component, OnInit } from '@angular/core';
import { StatisticsHttpService } from '../statistics-http.service';
import { UserHttpService } from '../user-http.service';
import { SocketioService } from '../socketio.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Statistic } from '../model/Statistic';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {

  private username: any;
  public user: any;
  public user_statistic: any;
  public statistics: Statistic[] = [];

  constructor(private stats_service: StatisticsHttpService, private us: UserHttpService, private route: ActivatedRoute, 
    private router: Router, private ios: SocketioService) { }

  ngOnInit(): void {
    this.username = this.route.snapshot.paramMap.get('username');
    this.get_socket_statistics();
    if (this.username) {
      this.get_user();
      this.get_statistic();
    } else {
      this.get_statistics();
    }
  }

  private get_socket_statistics(): void {
    this.ios.get_update('updateStatistics').subscribe(() => {
      if (this.username)
        this.get_statistic();
      else
        this.get_statistics();
    });
  }

  private get_user(): void {
    this.us.get_user(this.username).subscribe({
      next: (user) => {
        this.user = user;
      },
      error: (err) => {this.router.navigate(["notfound"]);}
    });
  }

  private get_statistic(): void {
    this.stats_service.get_statistic(this.username).subscribe({
      next: (stat) => {
        this.user_statistic = stat;
      },
      error: (err) => {console.log(err);}
    });
  }

  private get_statistics(): void {
    this.stats_service.get_statistics().subscribe({
      next: (stats) => {
        this.statistics = stats;
      },
      error: (err) => {console.log(err);}
    });
  }

  public waiter_people_served(): number {
    let amount = 0;
    this.user_statistic?.tables_opened.forEach((table_tern: [number, number, number]) => {
      amount += table_tern[2];
    })
    return amount;
  }

  public cashier_total_revenue(): number {
    let amount = 0;
    this.user_statistic?.tables_closed.forEach((table_tern: [number, number, number]) => {
      amount += table_tern[2];
    })
    return amount;
  }

  public compute_revenue(): number {
    let amount = 0;
    this.statistics.forEach((stat: any) => {
      amount += stat.total_revenue;
    });
    return amount;
  }

  public compute_tables_served(index: number): number {
    let amount = 0;
    this.statistics.forEach((stat: any) => {
      if (stat.tables_opened) {
        stat.tables_opened.forEach((table_tern: [number, number, number]) => {
          amount += table_tern[index];
        });
      }
    });
    return amount;
  }

  public compute_orders_made(): number {
    let amount = 0;
    this.statistics.forEach((stat: any) => {
      if (stat.dishes_prepared) {
        stat.dishes_prepared.forEach((dish_pair: [string, number]) => {
          amount += +dish_pair[1];
        });
      }
    });
    return amount;
  }

  public reset_statistics(): void {
    this.stats_service.reset_statistics({'num_orders': 0, 'dishes_prepared': [], 'tables_opened': [], 'tables_closed': []}).subscribe( {
      next: () => {
      console.log('Statistics reset');
      window.location.reload();
    },
    error: (error) => {
      console.log('Error occurred while posting: ' + error);
    }});
  }
}
