import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  animate,
  AnimationEvent,
  keyframes,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { Topology, GeometryCollection } from 'topojson-specification';
import { Country, AnimationPhase } from '../../models/country.model';

type WorldTopology = Topology<{ countries: GeometryCollection }>;

@Component({
  selector: 'app-world-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './world-map.component.html',
  styleUrl: './world-map.component.css',
  animations: [
    trigger('dartFlight', [
      state('idle', style({
        opacity: 0,
        transform: 'translate(-50%, -50%) scale(0)',
        left: '50%',
        top: '50%',
      })),
      state('throwing', style({
        opacity: 1,
        transform: 'translate(-50%, -50%) scale(1.6) rotate(-45deg)',
        left: '{{ targetX }}px',
        top: '{{ targetY }}px',
      }), { params: { targetX: 0, targetY: 0 } }),
      state('landed', style({
        opacity: 1,
        transform: 'translate(-50%, -50%) scale(1.2) rotate(0deg)',
        left: '{{ targetX }}px',
        top: '{{ targetY }}px',
      }), { params: { targetX: 0, targetY: 0 } }),
      transition('idle => throwing', animate('900ms cubic-bezier(0.25, 0.46, 0.45, 0.94)')),
      transition('throwing => landed', animate('150ms ease-out')),
      transition('* => idle', animate('200ms ease-in')),
    ]),
  ],
})
export class WorldMapComponent implements OnInit, OnChanges, OnDestroy {
  @Input() targetCountry: Country | null = null;
  @Input() animationPhase: AnimationPhase = 'idle';
  @Output() dartLanded = new EventEmitter<void>();

  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  dartTargetX = 0;
  dartTargetY = 0;
  dartState: 'idle' | 'throwing' | 'landed' = 'idle';

  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null;
  private projection: d3.GeoProjection | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private highlightedId: number | null = null;

  constructor(private ngZone: NgZone) {}

  ngOnInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.initMap();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['animationPhase']) {
      const phase = changes['animationPhase'].currentValue as AnimationPhase;
      if (phase === 'throwing' && this.targetCountry) {
        this.launchDart(this.targetCountry);
      }
      if (phase === 'idle') {
        this.dartState = 'idle';
        this.clearHighlight();
      }
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  private async initMap(): Promise<void> {
    const el = this.mapContainer.nativeElement;

    const topology = await d3.json<WorldTopology>(
      'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'
    );
    if (!topology) return;

    const w = el.clientWidth || 800;
    const h = el.clientHeight || 450;

    this.projection = d3.geoNaturalEarth1()
      .scale(w / 1.35 / Math.PI)
      .translate([w / 2, h / 2]);

    const pathGen = d3.geoPath().projection(this.projection);

    this.svg = d3.select(el)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${w} ${h}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Graticule
    const graticule = d3.geoGraticule();
    this.svg.append('path')
      .datum(graticule())
      .attr('d', pathGen)
      .attr('fill', 'none')
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 0.3);

    // Countries
    const features = topojson.feature(topology, topology.objects.countries).features;
    this.svg.selectAll<SVGPathElement, (typeof features)[0]>('path.country')
      .data(features)
      .join('path')
      .attr('class', 'country')
      .attr('d', pathGen as never)
      .attr('fill', '#1e3a5f')
      .attr('stroke', '#334155')
      .attr('stroke-width', 0.5);

    // Borders
    this.svg.append('path')
      .datum(topojson.mesh(topology, topology.objects.countries, (a, b) => a !== b))
      .attr('d', pathGen as never)
      .attr('fill', 'none')
      .attr('stroke', '#334155')
      .attr('stroke-width', 0.3);

    // Responsive resize
    this.resizeObserver = new ResizeObserver(() => {
      this.ngZone.runOutsideAngular(() => this.onResize());
    });
    this.resizeObserver.observe(el);
  }

  private onResize(): void {
    const el = this.mapContainer.nativeElement;
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (!this.projection || !this.svg || !w || !h) return;

    this.projection
      .scale(w / 1.35 / Math.PI)
      .translate([w / 2, h / 2]);

    const pathGen = d3.geoPath().projection(this.projection);
    this.svg.selectAll('path').attr('d', pathGen as never);
  }

  private launchDart(country: Country): void {
    if (!this.projection) return;
    const el = this.mapContainer.nativeElement;
    const coords = this.projection([country.longitude, country.latitude]);
    if (!coords) return;

    // Convert SVG coords to DOM coords using viewBox ratio
    const svgEl = el.querySelector('svg');
    if (!svgEl) return;
    const rect = el.getBoundingClientRect();
    const svgRect = svgEl.getBoundingClientRect();
    const scaleX = svgRect.width / (svgEl.viewBox.baseVal.width || svgRect.width);
    const scaleY = svgRect.height / (svgEl.viewBox.baseVal.height || svgRect.height);

    this.ngZone.run(() => {
      this.dartTargetX = coords[0] * scaleX;
      this.dartTargetY = coords[1] * scaleY;
      this.dartState = 'throwing';
    });
  }

  onDartAnimationDone(event: AnimationEvent): void {
    if (event.toState === 'throwing') {
      this.dartState = 'landed';
    } else if (event.toState === 'landed') {
      if (this.targetCountry) {
        this.highlightCountry(this.targetCountry.id);
      }
      this.dartLanded.emit();
    }
  }

  private highlightCountry(id: number): void {
    if (!this.svg) return;
    this.clearHighlight();
    this.highlightedId = id;
    this.svg.selectAll<SVGPathElement, { id: number }>('path.country')
      .filter(d => d.id === id)
      .classed('country-pulse', true)
      .attr('fill', '#ef4444');
  }

  private clearHighlight(): void {
    if (!this.svg || this.highlightedId === null) return;
    this.svg.selectAll<SVGPathElement, { id: number }>('path.country')
      .filter(d => d.id === this.highlightedId)
      .classed('country-pulse', false)
      .attr('fill', '#1e3a5f');
    this.highlightedId = null;
  }

  get dartAnimState() {
    return {
      value: this.dartState,
      params: { targetX: this.dartTargetX, targetY: this.dartTargetY },
    };
  }
}
